<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_reminders', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('customer_id');
            $table->string('type_code', 50);
            $table->string('brand', 50);
            $table->boolean('send_sms')->default(true);
            $table->boolean('send_email')->default(true);
            $table->unsignedTinyInteger('interval_months');
            $table->date('start_date');
            $table->date('next_reminder_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->datetime('last_sent_at')->nullable();
            $table->enum('last_send_status', ['success', 'partial', 'failed'])->nullable();
            $table->unsignedSmallInteger('consecutive_failures')->default(0);
            $table->datetime('deactivated_at')->nullable();
            $table->enum('deactivated_reason', [
                'agent',
                'customer_sms_stop',
                'customer_email_unsubscribe',
                'subscription_churn',
                'gdpr_flag',
                'contact_unreachable',
            ])->nullable();
            $table->unsignedInteger('created_by')->nullable();
            $table->timestamps();

            $table->unique(['customer_id', 'type_code', 'brand']);
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_reminders');
    }
};
