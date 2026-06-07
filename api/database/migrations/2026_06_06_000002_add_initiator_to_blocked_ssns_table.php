<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blocked_ssns', function (Blueprint $table) {
            $table->string('initiator')->nullable()->after('reason');
        });
    }

    public function down(): void
    {
        Schema::table('blocked_ssns', function (Blueprint $table) {
            $table->dropColumn('initiator');
        });
    }
};
