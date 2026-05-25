<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('customer_id');
            $table->text('message');
            $table->string('brand', 100)->nullable();
            $table->string('initiator', 100)->nullable();
            $table->timestamps();

            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_comments');
    }
};
