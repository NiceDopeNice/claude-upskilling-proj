<?php

namespace Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('gdpr_customers')) {
            return;
        }

        Schema::create('gdpr_customers', function (Blueprint $table) {
            $table->id();
            $table->string('uuid', 50)->nullable();
            $table->unsignedBigInteger('customer_id')->unique();
            $table->enum('status', ['flagged', 'pending_review', 'anonymized', 'restored', 'rejected'])->default('flagged');
            $table->enum('exclusion_type', ['2y_after_starter', 'subscription_end']);
            $table->dateTime('flagged_at')->useCurrent();
            $table->dateTime('anonymized_at')->nullable();
            $table->dateTime('restored_at')->nullable();
            $table->longText('backup_data')->nullable();
            $table->unsignedBigInteger('requested_by')->nullable();
            $table->enum('source', ['manual', 'system'])->default('manual');
            $table->timestamps();

            $table->index('status');
            $table->index('exclusion_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gdpr_customers');
    }
};
