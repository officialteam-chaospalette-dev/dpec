# ログデータ動作確認スクリプト
$ErrorActionPreference = "Continue"
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== ログデータ動作確認テスト ===" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:8000/api"
$testSessionId = "test_logs_session_$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "テストセッションID: $testSessionId" -ForegroundColor Yellow
Write-Host ""

# 1. session_startログの送信
Write-Host "1. session_startログの送信テスト..." -ForegroundColor Yellow
$sessionStartBody = @{
    session_id = $testSessionId
    event_type = "session_start"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        participant_id = $null
        pattern_intensity = "low"
    }
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-RestMethod -Uri "$API_URL/logs" -Method POST -Body $sessionStartBody -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    Write-Host "SUCCESS: session_startログを保存しました" -ForegroundColor Green
    Write-Host "  ログID: $($response1.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "FAILED: session_startログの保存に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 2. page_viewログの送信（商品一覧）
Write-Host "2. page_viewログの送信テスト（商品一覧）..." -ForegroundColor Yellow
$pageViewBody1 = @{
    session_id = $testSessionId
    event_type = "page_view"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        participant_id = $null
        pattern_intensity = "low"
        page_name = "product_list"
    }
} | ConvertTo-Json -Depth 10

try {
    $response2 = Invoke-RestMethod -Uri "$API_URL/logs" -Method POST -Body $pageViewBody1 -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    Write-Host "SUCCESS: page_viewログ（商品一覧）を保存しました" -ForegroundColor Green
    Write-Host "  ログID: $($response2.id)" -ForegroundColor Gray
    Write-Host ""
    Start-Sleep -Seconds 1
} catch {
    Write-Host "FAILED: page_viewログの保存に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 3. decision_eventログの送信（SKU選択）
Write-Host "3. decision_eventログの送信テスト（SKU選択）..." -ForegroundColor Yellow
$decisionBody = @{
    session_id = $testSessionId
    event_type = "decision_event"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        participant_id = $null
        pattern_intensity = "low"
        decision_type = "sku_selection"
        product_id = 101
        sku_id = "p101-1"
        sku_price = 13800
        is_lowest_price = true
        was_default = true
    }
} | ConvertTo-Json -Depth 10

try {
    $response3 = Invoke-RestMethod -Uri "$API_URL/logs" -Method POST -Body $decisionBody -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    Write-Host "SUCCESS: decision_eventログ（SKU選択）を保存しました" -ForegroundColor Green
    Write-Host "  ログID: $($response3.id)" -ForegroundColor Gray
    Write-Host ""
    Start-Sleep -Seconds 1
} catch {
    Write-Host "FAILED: decision_eventログの保存に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 4. page_viewログの送信（商品詳細）
Write-Host "4. page_viewログの送信テスト（商品詳細）..." -ForegroundColor Yellow
$pageViewBody2 = @{
    session_id = $testSessionId
    event_type = "page_view"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        participant_id = $null
        pattern_intensity = "low"
        page_name = "product_detail"
        product_id = 101
    }
} | ConvertTo-Json -Depth 10

try {
    $response4 = Invoke-RestMethod -Uri "$API_URL/logs" -Method POST -Body $pageViewBody2 -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    Write-Host "SUCCESS: page_viewログ（商品詳細）を保存しました" -ForegroundColor Green
    Write-Host "  ログID: $($response4.id)" -ForegroundColor Gray
    Write-Host ""
    Start-Sleep -Seconds 1
} catch {
    Write-Host "FAILED: page_viewログの保存に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 5. purchase_completeログの送信
Write-Host "5. purchase_completeログの送信テスト..." -ForegroundColor Yellow
$purchaseBody = @{
    session_id = $testSessionId
    event_type = "purchase_complete"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        participant_id = "12345678"
        pattern_intensity = "low"
        product_id = 101
        base_price = 13800
        actual_paid_price = 13800
        selected_sku_id = "p101-1"
        selected_sku_price = 13800
        is_lowest_price = true
        option_price = 2000
        hidden_fees = 700
        total_paid = 16500
        lowest_price = 13800
        lowest_total = 15500
        price_optimality = -1000
        decision_time_ms = 180000
        urgency_to_purchase_ms = 30000
        costs_reveal_to_purchase_ms = 15000
        selected_options = @{
            warranty = $true
            insurance = $false
            newsletter = $false
            premiumSupport = $false
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response5 = Invoke-RestMethod -Uri "$API_URL/logs" -Method POST -Body $purchaseBody -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    Write-Host "SUCCESS: purchase_completeログを保存しました" -ForegroundColor Green
    Write-Host "  ログID: $($response5.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "FAILED: purchase_completeログの保存に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 6. セッションログの取得テスト
Write-Host "6. セッションログの取得テスト..." -ForegroundColor Yellow
try {
    $sessionLogs = Invoke-RestMethod -Uri "$API_URL/logs/session/$testSessionId" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: セッションログを取得しました" -ForegroundColor Green
    Write-Host "  取得件数: $($sessionLogs.Count)" -ForegroundColor Gray
    Write-Host "  イベントタイプ一覧:" -ForegroundColor Gray
    foreach ($log in $sessionLogs) {
        Write-Host "    - $($log.event_type) (ID: $($log.id))" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "FAILED: セッションログの取得に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 7. セッションメトリクスの取得テスト
Write-Host "7. セッションメトリクスの取得テスト..." -ForegroundColor Yellow
try {
    $metrics = Invoke-RestMethod -Uri "$API_URL/logs/session/$testSessionId/metrics" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: セッションメトリクスを取得しました" -ForegroundColor Green
    if ($metrics.success) {
        Write-Host "  評価指標:" -ForegroundColor Gray
        $metrics.metrics.PSObject.Properties | ForEach-Object {
            Write-Host "    - $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  メッセージ: $($metrics.message)" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "FAILED: セッションメトリクスの取得に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 8. イベントタイプ別ログの取得テスト（purchase_complete）
Write-Host "8. イベントタイプ別ログの取得テスト（purchase_complete）..." -ForegroundColor Yellow
try {
    $eventLogs = Invoke-RestMethod -Uri "$API_URL/logs/event/purchase_complete" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: purchase_completeログを取得しました" -ForegroundColor Green
    Write-Host "  取得件数: $($eventLogs.Count)" -ForegroundColor Gray
    if ($eventLogs.Count -gt 0) {
        Write-Host "  最新の購入完了ログ:" -ForegroundColor Gray
        $latest = $eventLogs[0]
        Write-Host "    - セッションID: $($latest.session_id)" -ForegroundColor Gray
        Write-Host "    - 参加者ID: $($latest.data.participant_id)" -ForegroundColor Gray
        Write-Host "    - 合計金額: ¥$($latest.data.total_paid)" -ForegroundColor Gray
        Write-Host "    - 価格最適性: $($latest.data.price_optimality)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "FAILED: イベントタイプ別ログの取得に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 9. 集計データの取得テスト
Write-Host "9. 集計データの取得テスト..." -ForegroundColor Yellow
try {
    $analytics = Invoke-RestMethod -Uri "$API_URL/logs/analytics" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: 集計データを取得しました" -ForegroundColor Green
    Write-Host "  集計結果:" -ForegroundColor Gray
    $analytics.PSObject.Properties | ForEach-Object {
        if ($_.Value -is [PSCustomObject] -or $_.Value -is [Array]) {
            Write-Host "    - $($_.Name): (オブジェクト)" -ForegroundColor Gray
        } else {
            Write-Host "    - $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
    }
    Write-Host ""
} catch {
    Write-Host "FAILED: 集計データの取得に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== テスト完了 ===" -ForegroundColor Cyan
Write-Host "テストセッションID: $testSessionId" -ForegroundColor Yellow
Write-Host ""
Write-Host "以下のコマンドでデータベースを確認できます:" -ForegroundColor Gray
Write-Host "docker-compose exec backend php artisan tinker" -ForegroundColor White
Write-Host ""
Write-Host "Tinker内で以下のコマンドを実行:" -ForegroundColor Gray
Write-Host "App\Models\UserLog::where('session_id', '$testSessionId')->get();" -ForegroundColor White
