# APIエラー「Cannot GET /api」の解決方法

## エラーの原因

「Cannot GET /api」というエラーは、`/api`というエンドポイントに直接GETリクエストを送っているが、そのルートが存在しないために発生します。

LaravelのAPIルートは以下のように定義されています：
- `/api/logs` - ログ関連
- `/api/consent-forms` - 同意書関連

`/api`自体にはルートが定義されていないため、直接アクセスするとエラーになります。

## 解決方法

### 1. 正しいエンドポイントを使用する

`/api`に直接アクセスするのではなく、具体的なエンドポイントを使用してください：

**❌ 間違い:**
```
GET https://ec-backend-xxxx.onrender.com/api
```

**✅ 正しい:**
```
GET https://ec-backend-xxxx.onrender.com/api/logs/analytics
GET https://ec-backend-xxxx.onrender.com/api/consent-forms
```

### 2. ヘルスチェック用のエンドポイント

バックエンドの動作確認には、以下のエンドポイントを使用してください：

```powershell
# ヘルスチェック（推奨）
Invoke-RestMethod -Uri "https://ec-backend-xxxx.onrender.com/api/logs/analytics"

# または、Laravelのヘルスチェックエンドポイント
Invoke-RestMethod -Uri "https://ec-backend-xxxx.onrender.com/up"
```

### 3. 利用可能なAPIエンドポイント一覧

#### ログ関連
- `POST /api/logs` - ログを保存
- `GET /api/logs/session/{sessionId}` - セッションIDでログを取得
- `GET /api/logs/event/{eventType}` - イベントタイプでログを取得
- `GET /api/logs/analytics` - 集計データを取得（ヘルスチェックにも使用可能）
- `GET /api/logs/session/{sessionId}/metrics` - セッションの評価指標を取得
- `GET /api/logs/session/{sessionId}/visualization` - セッションの可視化データを取得

#### 同意書関連
- `GET /api/consent-forms` - 同意書一覧を取得
- `POST /api/consent-forms` - 同意書を保存
- `GET /api/consent-forms/participant/{participantId}` - 参加者IDで同意書を取得

### 4. ブラウザで確認する場合

ブラウザで直接確認する場合は、以下のURLを使用してください：

```
https://ec-backend-xxxx.onrender.com/api/logs/analytics
https://ec-backend-xxxx.onrender.com/api/consent-forms
```

### 5. フロントエンドからのアクセス

フロントエンドのコードでは、`API_URL`を使用してエンドポイントにアクセスします：

```javascript
// 正しい使用例
const response = await fetch(`${API_URL}/consent-forms`, {
  method: 'POST',
  // ...
});

// API_URLは既に '/api' を含んでいるため、
// 追加で '/api' を付けないでください
```

## トラブルシューティング

### 問題: フロントエンドから「Failed to fetch」エラーが発生

**原因**: 
- バックエンドが起動していない
- CORSの問題
- バックエンドURLが間違っている

**解決策**:
1. バックエンドのログを確認（Renderダッシュボード）
2. ブラウザの開発者ツール（F12）のConsoleタブで`API URL:`を確認
3. NetworkタブでリクエストのURLとステータスコードを確認

### 問題: 404エラーが発生

**原因**: 
- エンドポイントのURLが間違っている
- ルートが正しく登録されていない

**解決策**:
1. 上記の「利用可能なAPIエンドポイント一覧」を確認
2. Renderシェルでルートを確認：
   ```bash
   cd /var/www/html
   php artisan route:list | grep api
   ```

## まとめ

- `/api`に直接アクセスしない
- 具体的なエンドポイント（例：`/api/logs/analytics`）を使用する
- ヘルスチェックには`/api/logs/analytics`または`/up`を使用する
