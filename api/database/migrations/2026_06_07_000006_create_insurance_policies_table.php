<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_policies', function (Blueprint $table) {
            $table->string('id', 22)->primary();
            $table->string('uuid', 64)->nullable();
            $table->integer('customer_id')->index();
            $table->string('request_id', 100)->nullable();
            $table->string('external_customer_id', 100)->nullable();
            $table->string('product', 50)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('partner_reference', 100)->nullable();
            $table->json('metadata')->nullable();
            $table->string('relationship', 50)->nullable();
            $table->string('status', 20)->default('ACTIVE');
            $table->string('source', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_policies');
    }
};
