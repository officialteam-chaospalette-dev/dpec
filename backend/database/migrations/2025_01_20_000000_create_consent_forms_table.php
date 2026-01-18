<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('consent_forms', function (Blueprint $table) {
            $table->id();
            $table->string('participant_id', 50)->nullable()->index();
            $table->json('consent_checks')->nullable(); // 8つのチェックボックスの状態
            $table->string('risk_understanding', 10)->nullable(); // はい/いいえ
            $table->string('ec_usage_frequency', 50)->nullable(); // ECサイト利用頻度
            $table->string('name', 255)->nullable(); // 本名（任意）
            $table->string('vision', 255)->nullable(); // 視力・色覚（任意）
            $table->string('final_consent', 10)->nullable(); // 同意する/同意しない
            $table->string('session_id', 100)->nullable()->index(); // セッションID（後で紐付け可能）
            $table->timestamps();
            
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consent_forms');
    }
};


