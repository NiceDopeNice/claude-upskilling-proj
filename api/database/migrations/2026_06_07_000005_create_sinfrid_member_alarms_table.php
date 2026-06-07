<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sinfrid_member_alarms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('account_id')->index();
            $table->text('text')->nullable();
            $table->string('severity', 20)->nullable();
            $table->string('status', 20)->nullable();
            $table->string('category', 50)->nullable();
            $table->string('source', 50)->nullable();
            $table->boolean('coachme_available')->default(false);
            $table->text('coachme_description')->nullable();
            $table->timestamp('date')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->foreign('account_id')->references('id')->on('sinfrid_accounts')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sinfrid_member_alarms');
    }
};
