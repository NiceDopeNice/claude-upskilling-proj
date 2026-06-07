<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('blocked_ssns')) {
            return;
        }

        Schema::create('blocked_ssns', function (Blueprint $table) {
            $table->id();
            $table->string('pers_nr')->unique();
            $table->string('reason')->nullable();
            $table->string('added_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blocked_ssns');
    }
};
