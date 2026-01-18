#!/bin/sh
set -e

echo "Waiting for database to be ready..."

# データベースファイルが存在しない場合は作成
if [ ! -f "/var/www/html/database/database.sqlite" ]; then
    echo "Creating database file..."
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chmod 664 /var/www/html/database/database.sqlite
fi

# キャッシュをクリア（ルーティング問題を防ぐため）
echo "Clearing caches..."
php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true

# マイグレーションを実行
echo "Running database migrations..."
php artisan migrate --force || true

# ストレージのリンクを作成
echo "Creating storage link..."
php artisan storage:link || true

# ルート一覧を確認（デバッグ用）
echo "Available routes:"
php artisan route:list | head -20 || true

echo "Starting Laravel server..."
echo "PORT environment variable: ${PORT:-8000}"
exec "$@"
