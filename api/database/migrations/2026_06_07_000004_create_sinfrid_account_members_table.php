<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sinfrid_account_members', function (Blueprint $table) {
            $table->id();
            $table->string('uuid', 64)->nullable();
            $table->unsignedBigInteger('account_id')->index();
            $table->string('ssn', 50)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('city', 64)->nullable();
            $table->string('street', 255)->nullable();
            $table->string('zipcode', 11)->nullable();
            $table->string('lang_code', 2)->nullable();
            $table->string('country_code', 2)->nullable();
            $table->boolean('email_confirmed')->default(false);
            $table->boolean('phone_confirmed')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamp('deactivated_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('account_id')->references('id')->on('sinfrid_accounts')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sinfrid_account_members');
    }
};
