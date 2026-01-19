<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// CORS: OPTIONSリクエストを最初に処理
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    http_response_code(200);
    exit;
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$request = Request::capture();

try {
    $response = $app->handleRequest($request);
    
    // レスポンスがnullでないことを確認
    if ($response === null) {
        throw new \RuntimeException('Response is null');
    }
    
    // CORSヘッダーはCorsMiddlewareで既に追加されているため、ここでは追加しない
    
    // レスポンスを送信
    $response->send();
    
    // FastCGI環境では、finish_requestを使用してクライアントに応答を送信
    // この後は何も実行されないように、すぐに終了
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }
    
    // 即座に終了（これ以降のコードは実行されない）
    exit(0);
} catch (\Throwable $e) {
    // エラーが発生した場合でもCORSヘッダーを返す
    if (!headers_sent()) {
        http_response_code(500);
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Content-Type: application/json');
    }
    
    echo json_encode([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage()
    ]);
    
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }
    
    exit(1);
}
