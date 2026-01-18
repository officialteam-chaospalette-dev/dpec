<?php

namespace App\Http\Controllers;

use App\Models\UserLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LogController extends Controller
{
    /**
     * ログデータを受信して保存
     */
    public function store(Request $request)
    {
        $startTime = microtime(true);
        
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string|max:100',
            'event_type' => 'required|string|max:50',
            'timestamp' => 'required|date',
            'data' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            \Log::error('Log validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $log = UserLog::create([
                'session_id' => $request->session_id,
                'event_type' => $request->event_type,
                'timestamp' => $request->timestamp,
                'data' => $request->data ?? []
            ]);

            $elapsed = (microtime(true) - $startTime) * 1000;
            
            // 詳細なログ出力（視認性向上）
            $logData = [
                'id' => $log->id,
                'session_id' => $log->session_id,
                'event_type' => $log->event_type,
                'timestamp' => $log->timestamp->toDateTimeString(),
                'elapsed_ms' => round($elapsed, 2)
            ];
            
            // イベントタイプごとに詳細情報を追加
            if ($log->event_type === 'session_start') {
                $logData['participant_id'] = $request->data['participant_id'] ?? 'N/A';
                $logData['pattern_intensity'] = $request->data['pattern_intensity'] ?? 'N/A';
            } elseif ($log->event_type === 'page_view') {
                $logData['page_name'] = $request->data['page_name'] ?? 'N/A';
            } elseif ($log->event_type === 'decision_event') {
                $logData['decision_type'] = $request->data['decision_type'] ?? 'N/A';
            } elseif ($log->event_type === 'purchase_complete') {
                $logData['participant_id'] = $request->data['participant_id'] ?? 'N/A';
                $logData['total_paid'] = $request->data['total_paid'] ?? 'N/A';
                $logData['price_optimality'] = isset($request->data['lowest_total'], $request->data['total_paid'])
                    ? ($request->data['lowest_total'] - $request->data['total_paid'])
                    : 'N/A';
            }
            
            \Log::info('=== LOG SAVED ===', $logData);

            return response()->json([
                'success' => true,
                'id' => $log->id
            ], 201);
        } catch (\Exception $e) {
            \Log::error('=== LOG SAVE FAILED ===', [
                'session_id' => $request->session_id ?? 'N/A',
                'event_type' => $request->event_type ?? 'N/A',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save log: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * セッションIDでログを取得
     */
    public function getBySession($sessionId)
    {
        $logs = UserLog::where('session_id', $sessionId)
            ->orderBy('timestamp', 'asc')
            ->get();

        return response()->json($logs);
    }

    /**
     * イベントタイプでログを取得
     */
    public function getByEventType($eventType)
    {
        $logs = UserLog::where('event_type', $eventType)
            ->orderBy('timestamp', 'desc')
            ->get();

        return response()->json($logs);
    }

    /**
     * 集計データを取得（分析用）
     */
    public function getAnalytics(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = UserLog::query();

        if ($startDate) {
            $query->where('timestamp', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('timestamp', '<=', $endDate);
        }

        // イベントタイプごとの集計
        $eventTypeStats = UserLog::selectRaw('event_type, COUNT(*) as count')
            ->when($startDate, function ($q) use ($startDate) {
                return $q->where('timestamp', '>=', $startDate);
            })
            ->when($endDate, function ($q) use ($endDate) {
                return $q->where('timestamp', '<=', $endDate);
            })
            ->groupBy('event_type')
            ->get();

        // セッションごとの統計
        $sessionStats = UserLog::selectRaw('
                session_id,
                COUNT(*) as event_count,
                MIN(timestamp) as session_start,
                MAX(timestamp) as session_end
            ')
            ->when($startDate, function ($q) use ($startDate) {
                return $q->where('timestamp', '>=', $startDate);
            })
            ->when($endDate, function ($q) use ($endDate) {
                return $q->where('timestamp', '<=', $endDate);
            })
            ->groupBy('session_id')
            ->get();

        return response()->json([
            'event_type_stats' => $eventTypeStats,
            'session_stats' => $sessionStats,
            'total_logs' => $query->count()
        ]);
    }

    /**
     * セッションごとの評価指標を計算
     */
    public function getMetrics($sessionId)
    {
        try {
            $logs = UserLog::where('session_id', $sessionId)
                ->orderBy('timestamp', 'asc')
                ->get();

            if ($logs->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No logs found for session'
                ], 404);
            }

            $metrics = $this->calculateMetrics($logs);

            return response()->json([
                'success' => true,
                'session_id' => $sessionId,
                'metrics' => $metrics
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to calculate metrics', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate metrics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 評価指標を計算する内部メソッド
     */
    private function calculateMetrics($logs)
    {
        $sessionStart = null;
        $purchaseComplete = null;
        $pageViews = [];
        $decisionEvents = [];
        $lastPageView = null;

        // ログを分類
        foreach ($logs as $log) {
            $data = $log->data ?? [];
            
            switch ($log->event_type) {
                case 'session_start':
                    $sessionStart = $log->timestamp;
                    break;
                case 'page_view':
                    $pageViews[] = [
                        'page_name' => $data['page_name'] ?? null,
                        'timestamp' => $log->timestamp
                    ];
                    $lastPageView = $log->timestamp;
                    break;
                case 'decision_event':
                    $decisionEvents[] = [
                        'decision_type' => $data['decision_type'] ?? null,
                        'data' => $data,
                        'timestamp' => $log->timestamp
                    ];
                    break;
                case 'purchase_complete':
                    $purchaseComplete = [
                        'data' => $data,
                        'timestamp' => $log->timestamp
                    ];
                    break;
            }
        }

        $metrics = [];

        // 1. price_optimality（最終支払額の最適性）
        if ($purchaseComplete) {
            $lowestTotal = $purchaseComplete['data']['lowest_total'] ?? null;
            $totalPaid = $purchaseComplete['data']['total_paid'] ?? null;
            if ($lowestTotal !== null && $totalPaid !== null) {
                $metrics['price_optimality'] = $lowestTotal - $totalPaid;
            }
        }

        // 2. wrong_selection_rate（誤選択率）
        $skuSelections = array_filter($decisionEvents, function($event) {
            return $event['decision_type'] === 'sku_selection';
        });
        if (count($skuSelections) > 0) {
            $wrongSelections = array_filter($skuSelections, function($event) {
                return isset($event['data']['is_lowest_price']) && !$event['data']['is_lowest_price'];
            });
            $metrics['wrong_selection_rate'] = count($wrongSelections) / count($skuSelections);
        } else {
            $metrics['wrong_selection_rate'] = 0;
        }

        // 3. option_maintenance_rate（オプション維持率）
        $optionToggles = array_filter($decisionEvents, function($event) {
            return $event['decision_type'] === 'option_toggle';
        });
        if (count($optionToggles) > 0) {
            $maintainedOptions = 0;
            $totalDefaultOptions = 0;
            foreach ($optionToggles as $event) {
                $optionChanges = $event['data']['option_changes'] ?? [];
                foreach ($optionChanges as $change) {
                    if (isset($change['was_default']) && $change['was_default']) {
                        $totalDefaultOptions++;
                        if (isset($change['is_selected']) && $change['is_selected']) {
                            $maintainedOptions++;
                        }
                    }
                }
            }
            $metrics['option_maintenance_rate'] = $totalDefaultOptions > 0 
                ? $maintainedOptions / $totalDefaultOptions 
                : 0;
        } else {
            $metrics['option_maintenance_rate'] = 0;
        }

        // 4. comparison_actions（比較行動量）
        // 一覧と詳細の往復回数をカウント
        $comparisonCount = 0;
        $previousPage = null;
        foreach ($pageViews as $pageView) {
            $currentPage = $pageView['page_name'];
            if (($previousPage === 'product_list' && $currentPage === 'product_detail') ||
                ($previousPage === 'product_detail' && $currentPage === 'product_list')) {
                $comparisonCount++;
            }
            $previousPage = $currentPage;
        }
        $metrics['comparison_actions'] = $comparisonCount;

        // 5. decision_time（時間指標）
        if ($sessionStart && $purchaseComplete) {
            $startTime = strtotime($sessionStart);
            $endTime = strtotime($purchaseComplete['timestamp']);
            $metrics['decision_time_ms'] = ($endTime - $startTime) * 1000;
        } else {
            $metrics['decision_time_ms'] = null;
        }

        // 6. urgency_to_purchase_ms（緊急性提示後行動時間）
        if ($purchaseComplete) {
            $urgencyToPurchase = $purchaseComplete['data']['urgency_to_purchase_ms'] ?? null;
            $metrics['urgency_to_purchase_ms'] = $urgencyToPurchase;
        } else {
            $metrics['urgency_to_purchase_ms'] = null;
        }

        return $metrics;
    }

    /**
     * ログの可視化データを取得（視認性向上）
     */
    public function getVisualization($sessionId)
    {
        try {
            $logs = UserLog::where('session_id', $sessionId)
                ->orderBy('timestamp', 'asc')
                ->get();

            if ($logs->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No logs found for session'
                ], 404);
            }

            $visualization = [
                'session_id' => $sessionId,
                'total_events' => $logs->count(),
                'events' => [],
                'summary' => [
                    'session_start' => null,
                    'purchase_complete' => null,
                    'page_views' => 0,
                    'decision_events' => 0
                ]
            ];

            foreach ($logs as $log) {
                $event = [
                    'id' => $log->id,
                    'event_type' => $log->event_type,
                    'timestamp' => $log->timestamp->toDateTimeString(),
                    'data' => $log->data
                ];

                $visualization['events'][] = $event;

                // サマリーを更新
                switch ($log->event_type) {
                    case 'session_start':
                        $visualization['summary']['session_start'] = $log->timestamp->toDateTimeString();
                        break;
                    case 'purchase_complete':
                        $visualization['summary']['purchase_complete'] = $log->timestamp->toDateTimeString();
                        break;
                    case 'page_view':
                        $visualization['summary']['page_views']++;
                        break;
                    case 'decision_event':
                        $visualization['summary']['decision_events']++;
                        break;
                }
            }

            // 評価指標も含める
            $visualization['metrics'] = $this->calculateMetrics($logs);

            return response()->json([
                'success' => true,
                'visualization' => $visualization
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to get visualization', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get visualization: ' . $e->getMessage()
            ], 500);
        }
    }
}

