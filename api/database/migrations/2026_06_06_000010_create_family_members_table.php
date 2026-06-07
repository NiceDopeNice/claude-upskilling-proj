<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('family_members')) {
            return;
        }

        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('customer_id');
            $table->string('ssn', 40)->nullable();
            $table->string('first_name', 64)->nullable();
            $table->string('last_name', 64)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email', 64)->nullable();
            $table->string('street', 256)->nullable();
            $table->string('zip_code', 11)->nullable();
            $table->string('city', 64)->nullable();
            $table->timestamps();

            $table->foreign('customer_id')
                  ->references('to_user')
                  ->on('customer_profile')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_members');
    }
};
