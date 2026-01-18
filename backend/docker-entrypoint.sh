#!/bin/sh
set -e

echo "Waiting for database to be ready..."

# データベースファイルが存在しない場合は作成
if [ ! -f "/var/www/html/database/database.sqlite" ]; then
    echo "Creating database file..."
    touch /var/www/html/database/database.sqlite
fi

# マイグレーションを実行
echo "Running database migrations..."
php artisan migrate --force || true

# ストレージのリンクを作成
echo "Creating storage link..."
php artisan storage:link || true

echo "Starting Laravel server..."
exec "$@"
