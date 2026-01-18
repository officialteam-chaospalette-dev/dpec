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
        Schema::create('user_logs', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 100)->index();
            $table->string('event_type', 50)->index();
            $table->timestamp('timestamp');
            $table->json('data')->nullable();
            $table->timestamps();
            
            // セッションIDとイベントタイプでインデックス
            $table->index(['session_id', 'event_type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_logs');
    }
};

