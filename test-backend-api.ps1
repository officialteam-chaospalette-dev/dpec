# Backend API Test Script
# Usage: .\test-backend-api.ps1 -BackendUrl "https://ec-backend.onrender.com"

param(
    [string]$BackendUrl = "https://ec-backend.onrender.com"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Backend API Test" -ForegroundColor Cyan
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$apiBase = "$BackendUrl/api"

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    Write-Host "---" -ForegroundColor Gray
    Write-Host "Test: $Method $Url" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "[OK] Success" -ForegroundColor Green
        Write-Host "  Status: OK" -ForegroundColor Green
        Write-Host "  Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
        return $true
    }
    catch {
        $statusCode = $null
        $errorMessage = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
        }
        
        Write-Host "[FAIL] Error" -ForegroundColor Red
        if ($statusCode) {
            Write-Host "  Status: $statusCode" -ForegroundColor Red
        }
        Write-Host "  Error: $errorMessage" -ForegroundColor Red
        
        if ($errorMessage -like "*CORS*" -or $statusCode -eq 405) {
            Write-Host "  -> Possible CORS error" -ForegroundColor Red
        }
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Response Body: $responseBody" -ForegroundColor Gray
        }
        catch {
        }
        
        return $false
    }
}

# Test 1: Health check endpoint
Write-Host "1. Health Check Endpoint" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$apiBase/logs/analytics"
Write-Host ""

# Test 2: OPTIONS request (CORS preflight)
Write-Host "2. CORS Preflight (OPTIONS request)" -ForegroundColor Cyan
try {
    $optionsResponse = Invoke-WebRequest -Uri "$apiBase/logs" -Method OPTIONS -Headers @{
        "Origin" = "https://ec-frontend.onrender.com"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    } -ErrorAction Stop
    
    Write-Host "[OK] OPTIONS request successful" -ForegroundColor Green
    Write-Host "  Status: $($optionsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "  CORS Headers:" -ForegroundColor Gray
    $optionsResponse.Headers | Where-Object { $_.Key -like "Access-Control-*" } | ForEach-Object {
        Write-Host "    $($_.Key): $($_.Value)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "[FAIL] OPTIONS request failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: POST request (log save)
Write-Host "3. POST Request (Log Save)" -ForegroundColor Cyan
$testLogData = @{
    session_id = "test-session-$(Get-Date -Format 'yyyyMMddHHmmss')"
    event_type = "session_start"
    timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        participant_id = $null
        pattern_intensity = "low"
    }
}

$headers = @{
    "Origin" = "https://ec-frontend.onrender.com"
    "Content-Type" = "application/json"
}

Test-Endpoint -Method "POST" -Url "$apiBase/logs" -Headers $headers -Body $testLogData
Write-Host ""

# Test 4: GET request (consent forms list)
Write-Host "4. GET Request (Consent Forms List)" -ForegroundColor Cyan
$headers = @{
    "Origin" = "https://ec-frontend.onrender.com"
}
Test-Endpoint -Method "GET" -Url "$apiBase/consent-forms" -Headers $headers
Write-Host ""

# Test 5: Non-existent endpoint (404 test)
Write-Host "5. Non-existent Endpoint (404 Test)" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$apiBase/nonexistent" -Headers $headers
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
