# Render デプロイガイド

このドキュメントでは、ダークパターン影響感度検証アプリを Render にデプロイする手順を詳しく説明します。

## 前提条件

1. [Render](https://render.com) アカウントを作成
2. GitHub リポジトリにプッシュ済み
3. Render で GitHub アカウントと連携済み

## ステップ 1: バックエンドサービスのデプロイ

### 1.1 新しい Web Service を作成

1. Render ダッシュボードにログイン
2. 「New +」→ 「Web Service」を選択
3. GitHub リポジトリを選択して接続

### 1.2 バックエンド設定

以下の設定を入力：

**基本設定**
- **Name**: `ec-backend` (任意の名前)
- **Region**: 最寄りのリージョンを選択（例: `Singapore`）
- **Branch**: `main` または使用しているブランチ
- **Root Directory**: `backend`

**ビルド設定**
- **Runtime**: `PHP`
- **Build Command**:
  ```bash
  composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan config:cache && php artisan route:cache
  ```
- **Start Command**:
  ```bash
  php artisan serve --host=0.0.0.0 --port=$PORT
  ```

**環境変数**
以下の環境変数を追加：

| Key | Value |
|-----|-------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | `base64:YOUR_APP_KEY` (生成する必要があります) |
| `DB_CONNECTION` | `sqlite` |
| `DB_DATABASE` | `/opt/render/project/src/backend/database/database.sqlite` |
| `LOG_CHANNEL` | `stack` |

**APP_KEY の生成方法**
ローカルで以下を実行してキーを生成：
```bash
cd backend
php artisan key:generate --show
```
出力されたキーを環境変数に設定してください。

### 1.3 ディスクの追加（オプション）

永続的なストレージが必要な場合：

1. 「Advanced」セクションで「Add Disk」をクリック
2. 以下の設定：
   - **Name**: `backend-storage`
   - **Mount Path**: `/opt/render/project/src/backend/storage`
   - **Size**: `1 GB` (必要なサイズに応じて調整)

### 1.4 デプロイ

「Create Web Service」をクリックしてデプロイを開始します。

デプロイが完了したら、バックエンドの URL をメモしてください（例: `https://ec-backend.onrender.com`）。

## ステップ 2: フロントエンドサービスのデプロイ

### 2.1 新しい Static Site を作成

1. Render ダッシュボードで「New +」→ 「Static Site」を選択
2. GitHub リポジトリを選択

### 2.2 フロントエンド設定

以下の設定を入力：

**基本設定**
- **Name**: `ec-frontend`
- **Branch**: `main` または使用しているブランチ
- **Root Directory**: `frontend`

**ビルド設定**
- **Build Command**:
  ```bash
  npm ci && npm run build
  ```
- **Publish Directory**: `dist`

**環境変数**
以下の環境変数を追加：

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://ec-backend.onrender.com/api` |

（`ec-backend` の部分は、ステップ 1.4 でメモした実際のバックエンド URL に置き換えてください）

### 2.3 デプロイ

「Create Static Site」をクリックしてデプロイを開始します。

## ステップ 3: データベースの初期化

### 3.1 マイグレーションの実行

バックエンドサービスがデプロイされたら、Render のシェルから以下を実行：

1. Render ダッシュボードでバックエンドサービスを開く
2. 「Shell」タブをクリック
3. 以下のコマンドを実行：

```bash
cd /opt/render/project/src/backend
php artisan migrate
```

### 3.2 データベースファイルの確認

データベースファイルが作成されているか確認：

```bash
ls -la database/
```

`database.sqlite` ファイルが存在することを確認してください。

## ステップ 4: 動作確認

### 4.1 フロントエンドの確認

1. フロントエンドサービスの URL にアクセス
2. 商品一覧が表示されることを確認
3. 商品をクリックして詳細ページに遷移できることを確認

### 4.2 ログ収集の確認

1. ブラウザの開発者ツールを開く（F12）
2. 「Network」タブを開く
3. ページを操作（商品をクリック、フィルターを変更など）
4. `POST /api/logs` へのリクエストが送信されていることを確認

### 4.3 バックエンド API の確認

以下のエンドポイントにアクセスして動作を確認：

- 集計データ: `https://ec-backend.onrender.com/api/logs/analytics`
- ヘルスチェック: `https://ec-backend.onrender.com/api/logs`

## トラブルシューティング

### バックエンドが起動しない

**問題**: ビルドは成功するが、サービスが起動しない

**解決策**:
1. ログを確認してエラーメッセージを確認
2. `APP_KEY` が正しく設定されているか確認
3. データベースファイルのパスが正しいか確認

### フロントエンドからバックエンドに接続できない

**問題**: フロントエンドから API リクエストが失敗する

**解決策**:
1. `VITE_API_URL` 環境変数が正しく設定されているか確認
2. バックエンドの URL が正しいか確認
3. CORS 設定を確認（`backend/config/cors.php`）

### データベースが作成されない

**問題**: マイグレーションが失敗する

**解決策**:
1. データベースファイルのディレクトリに書き込み権限があるか確認
2. ディスクが正しくマウントされているか確認
3. シェルから手動でデータベースファイルを作成：
   ```bash
   touch database/database.sqlite
   chmod 666 database/database.sqlite
   php artisan migrate
   ```

### ログが保存されない

**問題**: フロントエンドからログが送信されない

**解決策**:
1. ブラウザのコンソールでエラーを確認
2. ネットワークタブで API リクエストが送信されているか確認
3. バックエンドのログを確認してエラーがないか確認

## 継続的なデプロイ

GitHub にプッシュすると、自動的にデプロイがトリガーされます。

### 手動デプロイ

1. Render ダッシュボードでサービスを開く
2. 「Manual Deploy」→ 「Deploy latest commit」をクリック

## 本番環境の最適化

本番環境では、以下の追加設定を検討してください：

1. **環境変数**:
   - `APP_ENV=production`
   - `APP_DEBUG=false`

2. **キャッシュ**:
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan view:cache`

3. **セキュリティ**:
   - HTTPS の強制
   - CORS の適切な設定
   - レート制限の実装

4. **モニタリング**:
   - Render のログを監視
   - エラー通知の設定

## デプロイ後の運用

### ログデータの確認方法

#### 1. Render ダッシュボードから確認

1. Render ダッシュボードでバックエンドサービスを開く
2. 「Logs」タブをクリック
3. リアルタイムでログを確認できます

#### 2. API エンドポイントから確認

以下のエンドポイントを使用してデータを確認：

**同意書一覧（最新20件）**
```
GET https://ec-backend.onrender.com/api/consent-forms
```

**特定の参加者の同意書**
```
GET https://ec-backend.onrender.com/api/consent-forms/participant/{participantId}
```

**特定セッションのログ**
```
GET https://ec-backend.onrender.com/api/logs/session/{sessionId}
```

**セッションの評価指標**
```
GET https://ec-backend.onrender.com/api/logs/session/{sessionId}/metrics
```

**イベントタイプ別ログ**
```
GET https://ec-backend.onrender.com/api/logs/event/{eventType}
例: GET /api/logs/event/purchase_complete
```

**集計データ**
```
GET https://ec-backend.onrender.com/api/logs/analytics
```

#### 3. シェルからデータベースを直接確認

1. Render ダッシュボードでバックエンドサービスを開く
2. 「Shell」タブをクリック
3. 以下のコマンドを実行：

```bash
# データベースに接続
cd /opt/render/project/src/backend
php artisan tinker
```

Tinker内で実行：

```php
// 最新の同意書10件を取得
App\Models\ConsentForm::orderBy('created_at', 'desc')->take(10)->get();

// 最新のログ10件を取得
App\Models\UserLog::orderBy('created_at', 'desc')->take(10)->get();

// 特定セッションのログを取得
App\Models\UserLog::where('session_id', 'session_123')->get();

// 購入完了ログのみを取得
App\Models\UserLog::where('event_type', 'purchase_complete')->orderBy('created_at', 'desc')->get();

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
```

### データベースのバックアップ

Renderの無料プランでは、データベースファイルは永続的なディスクに保存されます。しかし、定期的なバックアップを推奨します。

#### バックアップ方法

1. Render シェルからデータベースファイルをエクスポート：

```bash
cd /opt/render/project/src/backend
cp database/database.sqlite ~/backup_$(date +%Y%m%d).sqlite
```

2. または、API経由でデータをJSON形式でエクスポート：

```bash
# 同意書データをエクスポート
curl https://ec-backend.onrender.com/api/consent-forms > consent_forms_$(date +%Y%m%d).json

# ログデータをエクスポート（特定セッション）
curl https://ec-backend.onrender.com/api/logs/session/{sessionId} > logs_session_{sessionId}.json
```

### サービスの監視

#### ヘルスチェック

Renderは自動的にヘルスチェックを行います。設定されたパス（`/api/logs/analytics`）にアクセスして、サービスが正常に動作しているか確認します。

手動で確認する場合：

```bash
curl https://ec-backend.onrender.com/api/logs/analytics
```

正常な場合は JSON レスポンスが返ります。

#### エラーの監視

1. Render ダッシュボードの「Logs」タブでエラーログを確認
2. アプリケーションログに`ERROR`レベルで記録されるエラーを確認
3. 必要に応じて、エラー通知を設定

### データベースのメンテナンス

#### 古いデータの削除

実験が完了した後、古いログデータを削除する場合：

```bash
# Tinkerで実行
# 30日以上前のログを削除
App\Models\UserLog::where('created_at', '<', now()->subDays(30))->delete();
```

#### データベースの最適化

SQLiteデータベースを最適化する場合：

```bash
php artisan tinker
```

```php
DB::statement('VACUUM');
```

### トラブルシューティング（デプロイ後）

#### APIエンドポイントが404を返す

**原因**: ルートキャッシュが古い、またはルートが正しく登録されていない

**解決策**:
```bash
php artisan route:clear
php artisan route:cache
```

#### データベースに書き込めない

**原因**: データベースファイルのパーミッションまたはディスク容量の問題

**解決策**:
1. ディスク容量を確認
2. データベースファイルのパーミッションを確認：
   ```bash
   ls -la database/database.sqlite
   chmod 666 database/database.sqlite
   ```

#### サービスがスリープする（無料プラン）

**原因**: Renderの無料プランでは、15分間アクセスがないとサービスがスリープします

**解決策**:
1. 定期的なアクセスを維持する（外部モニタリングサービスを使用）
2. 有料プランにアップグレード

## 参考リンク

- [Render ドキュメント](https://render.com/docs)
- [Laravel デプロイメントガイド](https://laravel.com/docs/deployment)
- [Vite ビルドガイド](https://vitejs.dev/guide/build.html)

