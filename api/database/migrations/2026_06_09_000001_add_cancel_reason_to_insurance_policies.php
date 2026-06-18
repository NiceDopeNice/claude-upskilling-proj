<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('insurance_policies')) {
            return;
        }

        Schema::table('insurance_policies', function (Blueprint $table) {
            if (!Schema::hasColumn('insurance_policies', 'cancel_reason')) {
                $table->string('cancel_reason', 500)->nullable()->after('status');
            }
            if (!Schema::hasColumn('insurance_policies', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable()->after('cancel_reason');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('insurance_policies')) {
            return;
        }

        Schema::table('insurance_policies', function (Blueprint $table) {
            $table->dropColumn(['cancel_reason', 'cancelled_at']);
        });
    }
};
