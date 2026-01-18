FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    zip unzip git sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install || true

# エントリーポイントスクリプトをコピーして実行権限を付与
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD sh -c "php artisan serve --host=0.0.0.0 --port=\${PORT:-8000}"
