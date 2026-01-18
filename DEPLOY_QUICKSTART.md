# Render デプロイ クイックスタート

このガイドでは、`render.yaml`を使用した簡単なデプロイ手順を説明します。

## 前提条件

1. [Render](https://render.com) アカウントを作成
2. GitHub リポジトリにプッシュ済み
3. Render で GitHub アカウントと連携済み

## デプロイ手順

### 方法1: render.yamlを使用（推奨）

1. **GitHubにrender.yamlをプッシュ**
   ```bash
   git add render.yaml
   git commit -m "Add render.yaml for deployment"
   git push origin main
   ```

2. **Renderダッシュボードでデプロイ**
   - Render ダッシュボードにログイン
   - 「New +」→ 「Blueprint」を選択
   - GitHub リポジトリを選択
   - Render が自動的に `render.yaml` を検出して設定を読み込みます

3. **環境変数の確認**
   - バックエンドサービス（`ec-backend`）の環境変数を確認：
     - `APP_KEY`: 既に `render.yaml` に設定済み
     - その他の環境変数も自動的に設定されます
   
   - フロントエンドサービス（`ec-frontend`）の環境変数を確認：
     - `VITE_API_URL`: バックエンドのURLに更新が必要な場合があります
     - デプロイ後、バックエンドの実際のURLを確認して更新してください

4. **デプロイの実行**
   - 「Apply」をクリックしてデプロイを開始
   - バックエンドが先にデプロイされます
   - バックエンドのURLを確認（例: `https://ec-backend-xxxx.onrender.com`）

5. **フロントエンドの環境変数を更新**
   - フロントエンドサービスの環境変数 `VITE_API_URL` を、実際のバックエンドURLに更新
   - 例: `https://ec-backend-xxxx.onrender.com/api`
   - 更新後、フロントエンドを再デプロイ

### 方法2: 手動でサービスを作成

詳細は `DEPLOY.md` を参照してください。

## デプロイ後の確認

### バックエンドの動作確認

1. **ヘルスチェック**
   ```
   GET https://ec-backend-xxxx.onrender.com/api/logs/analytics
   ```
   ブラウザで開くか、PowerShellで確認：
   ```powershell
   Invoke-RestMethod -Uri "https://ec-backend-xxxx.onrender.com/api/logs/analytics"
   ```

2. **APIエンドポイントの確認**
   ```powershell
   # セッションログの取得（空の配列が返るはず）
   Invoke-RestMethod -Uri "https://ec-backend-xxxx.onrender.com/api/logs/session/test_session"
   ```

### フロントエンドの動作確認

1. フロントエンドのURLにアクセス
2. 事前同意書が表示されることを確認
3. ログが正常に送信されることを確認（ブラウザの開発者ツールのNetworkタブで確認）

## トラブルシューティング

### バックエンドが起動しない

1. **ログを確認**
   - Render ダッシュボードの「Logs」タブでエラーを確認
   - よくあるエラー：
     - `APP_KEY` が設定されていない → `render.yaml` を確認
     - データベースファイルのパスが間違っている → ディスクのマウントパスを確認

2. **環境変数を確認**
   - Render ダッシュボードの「Environment」タブで環境変数を確認
   - `render.yaml` の設定が正しく反映されているか確認

### フロントエンドがAPIに接続できない

1. **CORSエラー**
   - バックエンドの `config/cors.php` を確認
   - `allowed_origins` にフロントエンドのURLを追加

2. **API URLの確認**
   - ブラウザの開発者ツールのConsoleタブで `API URL:` のログを確認
   - 環境変数 `VITE_API_URL` が正しく設定されているか確認

### データベースがリセットされる

- Render の無料プランでは、サービスが15分間非アクティブになるとスリープします
- スリープ中にデータベースファイルが削除される可能性があります
- 永続的なストレージが必要な場合は、有料プランへのアップグレードを検討してください

## 次のステップ

デプロイが完了したら、`DEPLOY.md` の「デプロイ後の運用」セクションを参照して、ログデータの確認方法やバックアップ手順を確認してください。
