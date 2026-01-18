# バックエンドURLの確認方法（手っ取り早く）

## 方法1: ブラウザの開発者ツールで確認（最も簡単）

1. フロントエンドのページ（質問票など）を開く
2. **F12キー**を押して開発者ツールを開く
3. **Console（コンソール）タブ**を開く
4. `API URL:`というログを探す

例：
```
API URL: https://ec-backend-xxxx.onrender.com/api
```

または

```
API URL: http://localhost:8000/api
```

## 方法2: Renderダッシュボードで確認

1. [Render Dashboard](https://dashboard.render.com)にログイン
2. `ec-backend`サービスを開く
3. 上部に表示されているURLを確認

例：
```
https://ec-backend-xxxx.onrender.com
```

APIエンドポイントは、このURLに`/api`を追加：
```
https://ec-backend-xxxx.onrender.com/api
```

## 方法3: ネットワークタブで確認

1. フロントエンドのページを開く
2. **F12キー**を押して開発者ツールを開く
3. **Network（ネットワーク）タブ**を開く
4. 質問票を送信する
5. `/consent-forms`または`/logs`へのリクエストを探す
6. リクエストのURLを確認

例：
```
POST https://ec-backend-xxxx.onrender.com/api/consent-forms
```

## 方法4: 環境変数から確認（Renderの場合）

1. Renderダッシュボードで`ec-frontend`サービスを開く
2. **Environment**タブを開く
3. `VITE_API_URL`の値を確認

## 実際のバックエンドURLの形式

- **開発環境**: `http://localhost:8000/api`
- **本番環境（Render）**: `https://ec-backend-xxxx.onrender.com/api`
  - `xxxx`の部分は、Renderが自動生成したサービス名

## 確認用コマンド（PowerShell）

バックエンドURLが分かっている場合、動作確認：

```powershell
# バックエンドURLを設定（実際のURLに置き換える）
$backendUrl = "https://ec-backend-xxxx.onrender.com"

# ヘルスチェック
Invoke-RestMethod -Uri "$backendUrl/api/logs/analytics"
```

正常な場合は、JSONレスポンスが返ります。
