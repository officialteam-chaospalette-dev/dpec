<?php

namespace App\Http\Controllers;

use App\Models\ConsentForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConsentFormController extends Controller
{
    /**
     * 事前同意書データを受信して保存
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'participant_id' => 'nullable|string|max:50', // チェックアウト完了時に生成されるためnullable
            'consent_checks' => 'required|array|size:8',
            'consent_checks.*' => 'required|boolean',
            'risk_understanding' => 'required|string|in:はい,いいえ',
            'ec_usage_frequency' => 'required|string|in:毎日,週に数回,月数回,ほとんど使わない',
            'name' => 'nullable|string|max:255',
            'vision' => 'nullable|string|max:255',
            'final_consent' => 'required|string|in:同意する,同意しない',
            'session_id' => 'nullable|string|max:100'
        ]);

        if ($validator->fails()) {
            \Log::error('Consent form validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // すべてのチェックボックスがtrueであることを確認
        $allChecked = array_reduce($request->consent_checks, function ($carry, $item) {
            return $carry && $item === true;
        }, true);

        if (!$allChecked) {
            return response()->json([
                'success' => false,
                'errors' => ['consent_checks' => ['すべての同意項目にチェックが必要です。']]
            ], 422);
        }

        // リスク理解が「はい」であることを確認
        if ($request->risk_understanding !== 'はい') {
            return response()->json([
                'success' => false,
                'errors' => ['risk_understanding' => ['リスク・不利益の理解について「はい」を選択してください。']]
            ], 422);
        }

        // 最終同意が「同意する」であることを確認
        if ($request->final_consent !== '同意する') {
            return response()->json([
                'success' => false,
                'errors' => ['final_consent' => ['実験に参加するには「同意する」を選択してください。']]
            ], 422);
        }

        try {
            $consentForm = ConsentForm::create([
                'participant_id' => $request->participant_id,
                'consent_checks' => $request->consent_checks,
                'risk_understanding' => $request->risk_understanding,
                'ec_usage_frequency' => $request->ec_usage_frequency,
                'name' => $request->name,
                'vision' => $request->vision,
                'final_consent' => $request->final_consent,
                'session_id' => $request->session_id
            ]);

            \Log::info('Consent form saved successfully', ['id' => $consentForm->id, 'participant_id' => $consentForm->participant_id]);

            return response()->json([
                'success' => true,
                'id' => $consentForm->id,
                'participant_id' => $consentForm->participant_id
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Failed to save consent form', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save consent form: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 同意書一覧を取得（最新20件）
     */
    public function index(Request $request)
    {
        $limit = $request->input('limit', 20);
        $consentForms = ConsentForm::orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'count' => $consentForms->count(),
            'data' => $consentForms
        ]);
    }

    /**
     * 参加者IDで同意書を取得
     */
    public function getByParticipantId($participantId)
    {
        $consentForm = ConsentForm::where('participant_id', $participantId)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$consentForm) {
            return response()->json([
                'success' => false,
                'message' => 'Consent form not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $consentForm
        ]);
    }
}

