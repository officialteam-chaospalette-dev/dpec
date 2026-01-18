# バックエンド運用ガイド

このドキュメントでは、Renderにデプロイしたバックエンドの運用方法を説明します。

## 目次

1. [日常的な運用](#日常的な運用)
2. [ログデータの確認](#ログデータの確認)
3. [データベースの管理](#データベースの管理)
4. [サービスの監視](#サービスの監視)
5. [トラブルシューティング](#トラブルシューティング)
6. [バックアップと復旧](#バックアップと復旧)

---

## 日常的な運用

### 1. サービスの状態確認

**Renderダッシュボードから確認:**
1. [Render Dashboard](https://dashboard.render.com)にログイン
2. `ec-backend`サービスを開く
3. 「Events」タブで最新のデプロイ状態を確認
4. 「Metrics」タブでCPU、メモリ、リクエスト数を確認

**ヘルスチェック:**
```powershell
# PowerShellで確認
Invoke-RestMethod -Uri "https://ec-backend-xxxx.onrender.com/api/logs/analytics"
```

正常な場合は、JSONレスポンスが返ります。

### 2. ログの確認

**Renderダッシュボードから:**
1. `ec-backend`サービスを開く
2. 「Logs」タブをクリック
3. リアルタイムでログを確認

**よく見るべきログ:**
- `ERROR`レベルのログ
- `LOG SAVE FAILED`のメッセージ
- データベース接続エラー
- メモリ不足の警告

---

## ログデータの確認

### 方法1: APIエンドポイントから確認（推奨）

**事前同意書の一覧取得:**
```powershell
# 最新20件の同意書を取得
$backendUrl = "https://ec-backend-xxxx.onrender.com"
Invoke-RestMethod -Uri "$backendUrl/api/consent-forms" | ConvertTo-Json -Depth 10
```

**特定セッションのログ取得:**
```powershell
$sessionId = "session_1234567890_abc123"
Invoke-RestMethod -Uri "$backendUrl/api/logs/session/$sessionId" | ConvertTo-Json -Depth 10
```

**セッションの評価指標取得:**
```powershell
Invoke-RestMethod -Uri "$backendUrl/api/logs/session/$sessionId/metrics" | ConvertTo-Json -Depth 10
```

**集計データ取得:**
```powershell
# 全期間の集計
Invoke-RestMethod -Uri "$backendUrl/api/logs/analytics" | ConvertTo-Json -Depth 10

# 特定期間の集計
$startDate = "2026-01-18"
$endDate = "2026-01-18"
Invoke-RestMethod -Uri "$backendUrl/api/logs/analytics?start_date=$startDate&end_date=$endDate" | ConvertTo-Json -Depth 10
```

**イベントタイプ別ログ取得:**
```powershell
# 購入完了イベントのみ
Invoke-RestMethod -Uri "$backendUrl/api/logs/event/purchase_complete" | ConvertTo-Json -Depth 10

# セッション開始イベントのみ
Invoke-RestMethod -Uri "$backendUrl/api/logs/event/session_start" | ConvertTo-Json -Depth 10
```

### 方法2: Renderシェルから確認

1. Renderダッシュボードで`ec-backend`サービスを開く
2. 「Shell」タブをクリック
3. 以下のコマンドを実行：

```bash
cd /var/www/html
php artisan tinker
```

**Tinker内で実行:**

```php
// 最新の同意書10件を取得
App\Models\ConsentForm::orderBy('created_at', 'desc')->take(10)->get();

// 最新のログ10件を取得
App\Models\UserLog::orderBy('created_at', 'desc')->take(10)->get();

// 特定セッションのログを取得
App\Models\UserLog::where('session_id', 'session_123')->get();

// 購入完了ログのみを取得
App\Models\UserLog::where('event_type', 'purchase_complete')
    ->orderBy('created_at', 'desc')
    ->get();

// 同意書の総数を確認
App\Models\ConsentForm::count();

// ログの総数を確認
App\Models\UserLog::count();

// セッション別のログ数を確認
App\Models\UserLog::select('session_id')
    ->selectRaw('COUNT(*) as count')
    ->groupBy('session_id')
    ->orderBy('count', 'desc')
    ->get();

// 特定参加者の同意書を取得
App\Models\ConsentForm::where('participant_id', '12345678')->first();
```

### 方法3: ブラウザから確認

以下のURLをブラウザで開く：

- **集計データ**: `https://ec-backend-xxxx.onrender.com/api/logs/analytics`
- **同意書一覧**: `https://ec-backend-xxxx.onrender.com/api/consent-forms`
- **特定セッション**: `https://ec-backend-xxxx.onrender.com/api/logs/session/{sessionId}`

---

## データベースの管理

### データベースファイルの場所

RenderのDockerコンテナ内では：
```
/var/www/html/database/database.sqlite
```

### データベースのバックアップ

**方法1: API経由でデータをエクスポート（推奨）**

```powershell
# 同意書データをエクスポート
$backendUrl = "https://ec-backend-xxxx.onrender.com"
$date = Get-Date -Format "yyyyMMdd"
Invoke-RestMethod -Uri "$backendUrl/api/consent-forms" | ConvertTo-Json -Depth 10 | Out-File "consent_forms_$date.json"

# 特定セッションのログをエクスポート
$sessionId = "session_1234567890_abc123"
Invoke-RestMethod -Uri "$backendUrl/api/logs/session/$sessionId" | ConvertTo-Json -Depth 10 | Out-File "logs_session_$sessionId.json"
```

**方法2: Renderシェルから直接コピー**

```bash
cd /var/www/html
cp database/database.sqlite ~/backup_$(date +%Y%m%d).sqlite
```

### 古いデータの削除

実験が完了した後、古いログデータを削除する場合：

```bash
# Renderシェルで実行
cd /var/www/html
php artisan tinker
```

```php
// 30日以上前のログを削除
App\Models\UserLog::where('created_at', '<', now()->subDays(30))->delete();

// 特定セッションのログを削除
App\Models\UserLog::where('session_id', 'session_123')->delete();
```

### データベースの最適化

SQLiteデータベースを最適化する場合：

```bash
php artisan tinker
```

```php
DB::statement('VACUUM');
```

---

## サービスの監視

### ヘルスチェック

Renderは自動的にヘルスチェックを行います。設定されたパス（`/api/logs/analytics`）にアクセスして、サービスが正常に動作しているか確認します。

**手動で確認:**
```powershell
Invoke-RestMethod -Uri "https://ec-backend-xxxx.onrender.com/api/logs/analytics"
```

### エラーの監視

1. **Renderダッシュボードの「Logs」タブ**でエラーログを確認
2. **アプリケーションログ**に`ERROR`レベルで記録されるエラーを確認
3. **必要に応じて、エラー通知を設定**（Renderの有料プランで利用可能）

### パフォーマンスの監視

**Renderダッシュボードから:**
1. `ec-backend`サービスを開く
2. 「Metrics」タブで以下を確認：
   - CPU使用率
   - メモリ使用量
   - リクエスト数
   - レスポンス時間

---

## トラブルシューティング

### 問題1: APIエンドポイントが404を返す

**原因**: ルートキャッシュが古い、またはルートが正しく登録されていない

**解決策:**
```bash
# Renderシェルで実行
cd /var/www/html
php artisan route:clear
php artisan route:cache
```

### 問題2: データベースに書き込めない

**原因**: データベースファイルのパーミッションまたはディスク容量の問題

**解決策:**
```bash
# Renderシェルで実行
cd /var/www/html
ls -la database/
chmod 664 database/database.sqlite
```

### 問題3: ログが保存されない

**確認事項:**
1. バックエンドのログを確認（Renderダッシュボードの「Logs」タブ）
2. データベース接続を確認
3. APIエンドポイントが正しいか確認

**デバッグ:**
```bash
# Renderシェルで実行
cd /var/www/html
php artisan tinker
```

```php
// 最新のログを確認
App\Models\UserLog::orderBy('created_at', 'desc')->take(5)->get();

// データベース接続を確認
DB::connection()->getPdo();
```

### 問題4: サービスがスリープしている

**原因**: Renderの無料プランでは、15分間非アクティブでスリープします

**解決策:**
- 初回アクセス時に約30秒かかります
- 定期的にヘルスチェックを実行する（有料プランでは自動）
- 有料プランにアップグレードする

### 問題5: メモリ不足エラー

**原因**: データベースが大きくなりすぎた、または同時リクエストが多すぎる

**解決策:**
1. 古いログデータを削除
2. データベースを最適化（`VACUUM`）
3. 有料プランにアップグレード（メモリ容量を増やす）

---

## バックアップと復旧

### 定期的なバックアップ

**推奨頻度**: 実験が完了するたび、または週1回

**バックアップスクリプト（PowerShell）:**

```powershell
# backup_backend.ps1
$backendUrl = "https://ec-backend-xxxx.onrender.com"
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\backups"

# バックアップディレクトリを作成
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

# 同意書データをバックアップ
Write-Host "Backing up consent forms..."
Invoke-RestMethod -Uri "$backendUrl/api/consent-forms" | 
    ConvertTo-Json -Depth 10 | 
    Out-File "$backupDir\consent_forms_$date.json"

# 集計データをバックアップ
Write-Host "Backing up analytics..."
Invoke-RestMethod -Uri "$backendUrl/api/logs/analytics" | 
    ConvertTo-Json -Depth 10 | 
    Out-File "$backupDir\analytics_$date.json"

Write-Host "Backup completed: $date"
```

### データの復旧

バックアップからデータを復旧する場合は、APIエンドポイントを使用してデータを再投入する必要があります。

---

## よく使うコマンド一覧

### PowerShell（ローカルから）

```powershell
# バックエンドURLを設定
$backendUrl = "https://ec-backend-xxxx.onrender.com"

# ヘルスチェック
Invoke-RestMethod -Uri "$backendUrl/api/logs/analytics"

# 同意書一覧
Invoke-RestMethod -Uri "$backendUrl/api/consent-forms" | ConvertTo-Json -Depth 10

# 特定セッションのログ
$sessionId = "session_1234567890_abc123"
Invoke-RestMethod -Uri "$backendUrl/api/logs/session/$sessionId" | ConvertTo-Json -Depth 10

# 評価指標
Invoke-RestMethod -Uri "$backendUrl/api/logs/session/$sessionId/metrics" | ConvertTo-Json -Depth 10
```

### Renderシェル（サーバー上）

```bash
# データベースに接続
cd /var/www/html
php artisan tinker

# ルートキャッシュをクリア
php artisan route:clear
php artisan route:cache

# 設定キャッシュをクリア
php artisan config:clear
php artisan config:cache

# データベースの状態を確認
php artisan migrate:status
```

---

## 注意事項

1. **無料プランの制限**:
   - 15分間非アクティブでスリープ
   - 永続ディスクが使用できない（データベースファイルがリセットされる可能性）
   - メモリとCPUの制限

2. **データの永続化**:
   - 定期的にバックアップを取る
   - 重要なデータはAPI経由でエクスポートする

3. **セキュリティ**:
   - `APP_DEBUG=false`を設定
   - 環境変数に機密情報を保存しない
   - CORS設定を適切に設定

---

## サポート

問題が発生した場合：
1. Renderダッシュボードの「Logs」タブでエラーを確認
2. このドキュメントのトラブルシューティングセクションを確認
3. 必要に応じて、Renderのサポートに問い合わせ
