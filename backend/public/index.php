<?php

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
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$request = Request::capture();
$response = $kernel->handle($request);

$response->send();

// terminate()はレスポンス送信後に実行されるが、エラーが発生しないようにする
try {
    $kernel->terminate($request, $response);
} catch (\Throwable $e) {
    // terminate()でのエラーは無視（レスポンスは既に送信済み）
}

exit(0);
