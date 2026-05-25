<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_organizations', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->text('name')->nullable();
            $table->string('contact_email', 100)->nullable();
            $table->string('invoice_email', 100)->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_organizations');
    }
};
