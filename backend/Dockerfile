FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    zip unzip git sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# エントリーポイントスクリプトを先にコピー
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY . .

RUN composer install || true

EXPOSE 8000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "PORT=${PORT:-8000} && echo 'Starting php artisan serve on port $PORT' && php artisan serve --host=0.0.0.0 --port=$PORT --verbose"]
