# Backend API Test Script
$ErrorActionPreference = "Continue"
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Backend API Test ===" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:8000/api"
$testSessionId = "test_session_$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "1. Testing consent form submission..." -ForegroundColor Yellow
$consentBody = @{
    participant_id = $null
    consent_checks = @($true, $true, $true, $true, $true, $true, $true, $true)
    risk_understanding = "はい"
    ec_usage_frequency = "毎日"
    name = "テスト太郎"
    vision = "正常"
    final_consent = "同意する"
    session_id = $testSessionId
} | ConvertTo-Json

try {
    $consentResponse = Invoke-RestMethod -Uri "$API_URL/consent-forms" -Method POST -Body $consentBody -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    Write-Host "SUCCESS: Consent form saved" -ForegroundColor Green
    Write-Host "  ID: $($consentResponse.id)" -ForegroundColor Gray
    Write-Host "  Participant ID: $($consentResponse.participant_id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "FAILED: Consent form save error" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "2. Testing log save (session_start)..." -ForegroundColor Yellow
$logBody1 = @{
    session_id = $testSessionId
    event_type = "session_start"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        participant_id = $null
        pattern_intensity = "low"
    }
} | ConvertTo-Json -Depth 10

try {
    $logResponse1 = Invoke-RestMethod -Uri "$API_URL/logs" -Method POST -Body $logBody1 -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    Write-Host "SUCCESS: session_start log saved" -ForegroundColor Green
    Write-Host "  Log ID: $($logResponse1.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "FAILED: session_start log save error" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "3. Testing session log retrieval..." -ForegroundColor Yellow
try {
    $sessionLogs = Invoke-RestMethod -Uri "$API_URL/logs/session/$testSessionId" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: Session logs retrieved" -ForegroundColor Green
    Write-Host "  Count: $($sessionLogs.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "FAILED: Session log retrieval error" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host "Test Session ID: $testSessionId" -ForegroundColor Yellow
