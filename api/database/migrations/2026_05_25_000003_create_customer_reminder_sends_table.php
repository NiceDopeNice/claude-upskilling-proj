<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_reminder_sends', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reminder_id');
            $table->enum('channel', ['sms', 'email']);
            $table->datetime('sent_at');
            $table->enum('status', ['success', 'failed', 'skipped']);
            $table->enum('skip_reason', [
                'block_dm',
                'block_email',
                'no_phone',
                'no_email',
                'gdpr_flag',
                'template_missing',
            ])->nullable();
            $table->string('provider_message_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('created_at')->nullable();
            // append-only — no updated_at

            $table->index('reminder_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_reminder_sends');
    }
};
