<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('orders')) {
            return;
        }

        Schema::create('orders', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->dateTime('date_added');
            $table->date('date_shipped');
            $table->date('date_paid')->nullable();
            $table->date('date_purchased')->nullable();
            $table->string('url', 125)->nullable();
            $table->integer('by_user');
            $table->integer('campaign_id')->nullable();
            $table->text('cart');
            $table->longText('metadata')->nullable();
            $table->tinyInteger('has_prod');
            $table->tinyInteger('has_pack');
            $table->decimal('vat_rate', 11, 2)->nullable()->default(0.00);
            $table->decimal('total', 11, 2);
            $table->decimal('total_vat', 11, 2);
            $table->decimal('total_excluding_vat', 11, 2)->nullable();
            $table->decimal('total_with_coupon', 11, 2);
            $table->string('coupon')->default('');
            $table->enum('payment_method', ['faktura', 'kort'])->nullable();
            $table->tinyInteger('is_processed')->default(0);
            $table->tinyInteger('is_shipped')->default(0);
            $table->tinyInteger('is_paid')->nullable()->default(0);
            $table->string('ref', 64)->default('');
            $table->string('ref1', 65)->default('');
            $table->string('ref2', 65)->default('');
            $table->string('ip', 15)->nullable();
            $table->integer('prod_id');
            $table->string('invoice_no', 20)->default('');
            $table->string('sub_account_no', 100)->nullable();
            $table->integer('subscription_id')->nullable();
            $table->integer('gothia_account')->nullable();
            $table->string('origin')->nullable();
            $table->char('region_code', 2)->default('SE');
            $table->string('ipartner')->nullable();
            $table->enum('company_name', ['sgb', 'slp'])->nullable()->default('sgb');
            $table->enum('shipment_center', ['SE', 'EE', 'PL', 'HK'])->nullable()->default('PL');
            $table->string('audiofile_id')->nullable();
            $table->enum('partner', ['monitum', 'defentry'])->nullable();
            $table->tinyInteger('partner_sent')->default(0);
            $table->string('parcel_tracking_id', 30)->nullable();
            $table->string('reason')->nullable();
            $table->tinyInteger('is_pre_financed')->default(0);
            $table->tinyInteger('is_pre_generated')->default(0);
            $table->dateTime('event_processed_at')->nullable();
            $table->string('batch', 50)->nullable();

            $table->index('date_added');
            $table->index('date_shipped');
            $table->index('date_paid');
            $table->index('by_user');
            $table->index('campaign_id');
            $table->index('total');
            $table->index('is_shipped');
            $table->index('is_paid');
            $table->index('ref');
            $table->index('ref1');
            $table->index('ref2');
            $table->index('prod_id');
            $table->index('invoice_no');
            $table->index('subscription_id');
            $table->index('gothia_account');
            $table->index('region_code');
            $table->index('company_name');
            $table->index('shipment_center');
            $table->index('partner_sent');
            $table->index('batch');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
