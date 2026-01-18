// 商品データはフロントエンドで静的に管理するため、API呼び出しは不要
// ただし、ログ送信用のAPI URLは必要
export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 現在のホスト名を使用してAPI URLを構築
  const hostname = window.location.hostname;
  // 本番環境ではポート番号なし、開発環境では8000ポートを使用
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:8000/api`;
  }
  return `https://${hostname}/api`;
};

// ログ送信用のAPI URL
export const API_URL = getApiUrl();
