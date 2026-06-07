<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_changes', function (Blueprint $table) {
            $table->bigIncrements('change_id');
            $table->unsignedBigInteger('change_initiator_user_id')->nullable();
            $table->timestamp('change_date')->nullable();
            $table->unsignedBigInteger('change_batch_id')->index();
            $table->integer('change_user_id')->index();
            $table->string('change_action', 50)->nullable();
            $table->string('change_field', 100);
            $table->text('change_old_value')->nullable();
            $table->text('change_new_value')->nullable();

            $table->foreign('change_initiator_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_changes');
    }
};
