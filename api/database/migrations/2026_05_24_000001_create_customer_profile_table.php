<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_profile', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('to_user');
            $table->string('organization_id', 10)->nullable();
            $table->tinyInteger('status');
            $table->tinyInteger('first_visit')->default(0);
            $table->string('first_name', 64)->default('');
            $table->string('last_name', 64)->nullable()->default('');
            $table->string('pers_nr', 40)->default('');
            $table->enum('sex', ['male', 'female', 'unknown'])->default('unknown');
            $table->string('careof', 100)->nullable()->default('');
            $table->string('adress', 256)->nullable()->default('');
            $table->string('post_nr', 11)->nullable()->default('');
            $table->string('ort', 64)->nullable()->default('');
            $table->string('tel', 20)->nullable()->default('');
            $table->dateTime('date_added')->nullable();
            $table->string('email', 64)->nullable();
            $table->string('alternative_tel', 20)->nullable()->default('');
            $table->string('alternative_email', 64)->nullable()->default('');
            $table->tinyInteger('want_newsletter')->nullable()->default(1);
            $table->text('comments')->nullable();
            $table->integer('gothia_account')->nullable()->default(1);
            $table->json('ledgers')->nullable();
            $table->json('blocked_fees')->nullable();
            $table->tinyInteger('reminders')->nullable()->default(1);
            $table->tinyInteger('do_not_call')->nullable()->default(0);
            $table->unsignedTinyInteger('difficult_customer')->default(0);
            $table->char('region_code', 2)->default('SE');
            $table->char('language', 2)->nullable();
            $table->string('birthdate', 20)->nullable()->default('');
            $table->tinyInteger('sync')->default(1);
            $table->integer('credit_check')->nullable()->default(1);
            $table->timestamp('updated_at')->nullable()->useCurrent();

            $table->index('to_user', 'to_user_index');
            $table->index('pers_nr');
            $table->index('tel');
            $table->index('alternative_email', 'alternative_email_index');
            $table->index('alternative_tel', 'IDX_customer_profile_alternative_tel');
            $table->index('post_nr', 'IDX_postnr');
            $table->index('do_not_call', 'IDX_donotcal');
            $table->index('difficult_customer', 'IDX_difficult');
            $table->index('region_code', 'idx_region');
            $table->index('credit_check', 'IDX_credit_check');
            $table->index('sex', 'IDX_sex');
            $table->index('first_name', 'IDX_first_name');
            $table->index('last_name', 'IDX_last_name');
            $table->index('ort', 'IDX_ort');
            $table->index('email');
            $table->foreign('organization_id', 'fk_organization')->references('id')->on('customer_organizations');
            $table->index('date_added');
            $table->index(['to_user', 'region_code'], 'idx_customer_profile_to_user_region_code');

            $table->fullText('adress', 'IDX_adress');
            $table->fullText(['first_name', 'last_name'], 'FullName');
            $table->fullText(['first_name', 'last_name', 'adress'], 'FullNameAdress');
            $table->fullText('email', 'email_2');
            $table->fullText(['first_name', 'last_name', 'email', 'alternative_email'], 'FullNameEmail');
            $table->fullText(['first_name', 'last_name', 'adress', 'email', 'alternative_email'], 'FullNameAdressEmail');
            $table->fullText(['adress', 'email', 'alternative_email'], 'AdressEmail');
            $table->fullText(['first_name', 'pers_nr', 'tel', 'last_name', 'email', 'adress'], 'FullNameSsnEmailTelAdress');
            $table->fullText(['first_name', 'last_name', 'email'], 'FullNameEmailOnly');
            $table->fullText(['first_name', 'last_name', 'email', 'adress'], 'FullNameEmailAdress');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_profile');
    }
};
