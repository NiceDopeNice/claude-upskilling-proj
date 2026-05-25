<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_reminder_types', function (Blueprint $table) {
            $table->string('code', 50)->primary();
            $table->string('label_en', 100);
            $table->string('label_sv', 100);
            $table->unsignedTinyInteger('default_interval_months');
            $table->unsignedTinyInteger('min_interval_months');
            $table->unsignedTinyInteger('max_interval_months');
            $table->json('supported_brands');
            $table->json('metadata')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_reminder_types');
    }
};
