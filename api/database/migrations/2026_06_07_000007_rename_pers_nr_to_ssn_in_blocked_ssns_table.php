<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('blocked_ssns')) {
            return;
        }

        if (!Schema::hasColumn('blocked_ssns', 'pers_nr')) {
            return;
        }

        Schema::table('blocked_ssns', function (Blueprint $table) {
            $table->renameColumn('pers_nr', 'ssn');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('blocked_ssns') || !Schema::hasColumn('blocked_ssns', 'ssn')) {
            return;
        }

        Schema::table('blocked_ssns', function (Blueprint $table) {
            $table->renameColumn('ssn', 'pers_nr');
        });
    }
};
