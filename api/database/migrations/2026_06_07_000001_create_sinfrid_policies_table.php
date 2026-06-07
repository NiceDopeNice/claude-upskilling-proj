<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sinfrid_policies')) {
            return;
        }

        Schema::create('sinfrid_policies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('account_id');
            $table->string('policy_number')->nullable();
            $table->string('type')->nullable();
            $table->string('insurer')->nullable();
            $table->string('status')->default('active'); // active | cancelled | expired
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->timestamps();

            $table->index('account_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sinfrid_policies');
    }
};
