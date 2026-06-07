<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sinfrid_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('uuid', 64)->nullable()->unique();
            $table->integer('customer_id')->index();
            $table->string('type', 20)->nullable();
            $table->integer('plan_id')->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('city', 64)->nullable();
            $table->string('street', 255)->nullable();
            $table->string('zipcode', 11)->nullable();
            $table->string('lang_code', 2)->nullable();
            $table->string('country_code', 2)->nullable();
            $table->date('activation_date')->nullable();
            $table->boolean('email_confirmed')->default(false);
            $table->boolean('phone_confirmed')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('deactivated_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sinfrid_accounts');
    }
};
