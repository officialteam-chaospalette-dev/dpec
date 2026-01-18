# バックエンドAPI動作確認ガイド

## データベース構造

### user_logs テーブル
- `id`: 主キー
- `session_id`: セッションID（インデックス）
- `event_type`: イベントタイプ（session_start, page_view, decision_event, purchase_complete）
- `timestamp`: イベント発生時刻
- `data`: JSON形式のイベントデータ
- `created_at`, `updated_at`: タイムスタンプ

### consent_forms テーブル
- `id`: 主キー
- `participant_id`: 参加者ID（インデックス、nullable）
- `consent_checks`: 8つのチェックボックスの状態（JSON配列）
- `risk_understanding`: リスク理解（はい/いいえ）
- `ec_usage_frequency`: EC利用頻度（毎日/週に数回/月数回/ほとんど使わない）
- `name`: 本名（任意、nullable）
- `vision`: 視力・色覚（任意、nullable）
- `final_consent`: 最終同意（同意する/同意しない）
- `session_id`: セッションID（nullable、インデックス）
- `created_at`, `updated_at`: タイムスタンプ

## APIエンドポイント

### 1. ログ保存
```
POST http://localhost:8000/api/logs
Content-Type: application/json

{
  "session_id": "session_1234567890_abc",
  "event_type": "session_start",
  "timestamp": "2025-01-20T10:00:00Z",
  "data": {
    "participant_id": null,
    "pattern_intensity": "low"
  }
}
```

### 2. セッションIDでログ取得
```
GET http://localhost:8000/api/logs/session/{sessionId}
```

### 3. イベントタイプでログ取得
```
GET http://localhost:8000/api/logs/event/{eventType}
例: GET http://localhost:8000/api/logs/event/purchase_complete
```

### 4. セッションの評価指標取得
```
GET http://localhost:8000/api/logs/session/{sessionId}/metrics
```

### 5. セッションの可視化データ取得
```
GET http://localhost:8000/api/logs/session/{sessionId}/visualization
```

### 6. 事前同意書保存
```
POST http://localhost:8000/api/consent-forms
Content-Type: application/json

{
  "participant_id": null,
  "consent_checks": [true, true, true, true, true, true, true, true],
  "risk_understanding": "はい",
  "ec_usage_frequency": "毎日",
  "name": "テスト太郎",
  "vision": "正常",
  "final_consent": "同意する",
  "session_id": "session_1234567890_abc"
}
```

### 7. 参加者IDで同意書取得
```
GET http://localhost:8000/api/consent-forms/participant/{participantId}
```

## 動作確認方法

### 方法1: curlコマンド（PowerShell）

#### 事前同意書のテスト
```powershell
$body = @{
    participant_id = $null
    consent_checks = @($true, $true, $true, $true, $true, $true, $true, $true)
    risk_understanding = "はい"
    ec_usage_frequency = "毎日"
    name = "テスト太郎"
    vision = "正常"
    final_consent = "同意する"
    session_id = "test_session_123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/consent-forms" -Method POST -Body $body -ContentType "application/json"
```

#### ログ保存のテスト
```powershell
$body = @{
    session_id = "test_session_123"
    event_type = "session_start"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    data = @{
        participant_id = $null
        pattern_intensity = "low"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/api/logs" -Method POST -Body $body -ContentType "application/json"
```

#### ログ取得のテスト
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/logs/session/test_session_123" -Method GET
```

### 方法2: Dockerコンテナ内で確認

#### データベースに直接接続
```powershell
docker-compose exec backend php artisan tinker
```

Tinker内で実行：
```php
// 最新のログを10件取得
App\Models\UserLog::orderBy('created_at', 'desc')->take(10)->get();

// 最新の同意書を取得
App\Models\ConsentForm::orderBy('created_at', 'desc')->take(5)->get();

// 特定のセッションのログを取得
App\Models\UserLog::where('session_id', 'test_session_123')->get();
```

#### ログファイルを確認（Laravelログ）
```powershell
docker-compose exec backend tail -f storage/logs/laravel.log
```

### 方法3: ブラウザで確認（GETリクエスト）

ブラウザで以下のURLを開く：
```
http://localhost:8000/api/logs/session/{sessionId}
http://localhost:8000/api/logs/event/purchase_complete
http://localhost:8000/api/consent-forms/participant/{participantId}
```

## ログの見方

### イベントタイプ別のデータ構造

#### session_start
```json
{
  "session_id": "session_123",
  "event_type": "session_start",
  "timestamp": "2025-01-20T10:00:00Z",
  "data": {
    "participant_id": null,
    "pattern_intensity": "low"
  }
}
```

#### page_view
```json
{
  "session_id": "session_123",
  "event_type": "page_view",
  "timestamp": "2025-01-20T10:01:00Z",
  "data": {
    "participant_id": null,
    "pattern_intensity": "low",
    "page_name": "product_list"
  }
}
```

#### decision_event
```json
{
  "session_id": "session_123",
  "event_type": "decision_event",
  "timestamp": "2025-01-20T10:02:00Z",
  "data": {
    "participant_id": null,
    "pattern_intensity": "low",
    "decision_type": "sku_selection",
    "product_id": 101,
    "sku_id": "p101-1",
    "sku_price": 13800,
    "is_lowest_price": true
  }
}
```

#### purchase_complete
```json
{
  "session_id": "session_123",
  "event_type": "purchase_complete",
  "timestamp": "2025-01-20T10:05:00Z",
  "data": {
    "participant_id": "12345678",
    "pattern_intensity": "low",
    "product_id": 101,
    "base_price": 13800,
    "actual_paid_price": 13800,
    "selected_sku_id": "p101-1",
    "selected_sku_price": 13800,
    "total_paid": 14500,
    "price_optimality": 0,
    "decision_time_ms": 300000,
    ...
  }
}
```

## トラブルシューティング

### ログが保存されない場合
1. バックエンドログを確認: `docker-compose logs backend`
2. データベース接続を確認: `docker-compose exec backend php artisan migrate:status`
3. APIエンドポイントが正しいか確認: `docker-compose exec backend php artisan route:list | Select-String "log"`

### 同意書が保存されない場合
1. すべてのチェックボックスがtrueであることを確認
2. `risk_understanding`が「はい」であることを確認
3. `final_consent`が「同意する」であることを確認
4. バリデーションエラーを確認: レスポンスの`errors`フィールド
