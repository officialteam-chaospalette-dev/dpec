<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\ConsentFormController;

// 商品APIは削除（商品データはフロントエンドで静的に管理）

// ログ収集API
Route::post('/logs', [LogController::class, 'store']);
Route::get('/logs/session/{sessionId}', [LogController::class, 'getBySession']);
Route::get('/logs/event/{eventType}', [LogController::class, 'getByEventType']);
Route::get('/logs/analytics', [LogController::class, 'getAnalytics']);
Route::get('/logs/session/{sessionId}/metrics', [LogController::class, 'getMetrics']);
Route::get('/logs/session/{sessionId}/visualization', [LogController::class, 'getVisualization']);

// 事前同意書API
Route::get('/consent-forms', [ConsentFormController::class, 'index']); // 一覧取得
Route::post('/consent-forms', [ConsentFormController::class, 'store']); // 保存
Route::get('/consent-forms/participant/{participantId}', [ConsentFormController::class, 'getByParticipantId']); // 参加者IDで取得
