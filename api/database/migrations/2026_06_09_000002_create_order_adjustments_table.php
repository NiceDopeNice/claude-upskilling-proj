<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('order_adjustments')) {
            return;
        }

        Schema::create('order_adjustments', function (Blueprint $table) {
            $table->id();
            $table->integer('order_id')->index();
            $table->enum('type', ['fee', 'discount']);
            $table->decimal('amount', 11, 2);
            $table->string('reason', 500)->nullable();
            $table->string('created_by', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_adjustments');
    }
};
