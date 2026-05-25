<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_profile_extras', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('customer_id');
            $table->dateTime('date_cancelled')->nullable();
            $table->date('school_start')->nullable();
            $table->tinyInteger('block_dm')->default(0);
            $table->tinyInteger('block_gdpr')->default(0);
            $table->tinyInteger('trial_reducer')->default(0);
            $table->tinyInteger('trial_xantan')->default(0);
            $table->tinyInteger('trial_bredsp')->default(0);
            $table->tinyInteger('trial_sinfrid')->default(0);
            $table->date('trial_date')->nullable();
            $table->date('migration_date')->nullable();
            $table->unsignedTinyInteger('block_trials')->default(0);
            $table->tinyInteger('has_purchased')->default(0);
            $table->date('visited_introduction')->nullable();
            $table->integer('points_accumulated')->default(0);
            $table->integer('points_credits')->default(0);
            $table->integer('points_from_friends')->default(0);
            $table->integer('points_from_purchases')->default(0);
            $table->tinyInteger('stowaway')->default(0);
            $table->integer('parcel_machine')->nullable()->default(0);
            $table->mediumText('parcel_machine_name')->nullable();
            $table->enum('payment_preference', ['autogiro', 'b-post', 'email', 'sms', 'paper, no fee', 'einvoice'])->nullable();
            $table->string('delivery_method', 100)->nullable();
            $table->longText('metadata')->nullable();
            $table->timestamp('date_exported')->nullable();
            $table->tinyInteger('creditclass')->nullable();
            $table->string('bisnode_id', 30)->nullable();
            $table->integer('remark_count')->nullable();
            $table->mediumText('remarks')->nullable();
            $table->float('amount')->nullable();
            $table->string('other_remarks', 200)->nullable();
            $table->integer('household_adults')->nullable();
            $table->integer('household_children')->nullable();
            $table->timestamp('last_open_at')->nullable();
            $table->tinyInteger('block_email')->nullable()->default(0);

            $table->index('customer_id', 'to_user_index');
            $table->index('date_cancelled', 'IDX_date_cancelled');
            $table->index('stowaway', 'IDX_customer_profile_stowaway');
            $table->index('payment_preference', 'IDX_payment_preference');
            $table->index('trial_sinfrid', 'IDX_trial_sinfrid');
            $table->index('trial_date', 'IDX_trial_date');
            $table->index('migration_date', 'IDX_migration_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_profile_extras');
    }
};
