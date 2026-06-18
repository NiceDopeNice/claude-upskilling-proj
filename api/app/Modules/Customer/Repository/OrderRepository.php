<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/OrderRepository.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Repository;

use App\Modules\Customer\Repository\Contracts\OrderRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OrderRepository implements OrderRepositoryInterface
{
    /**
     * @param int $orderId
     * @return array|null
     */
    public function findById(int $orderId): ?array
    {
        $row = DB::table('orders as o')
            ->leftJoin('customer_profile as cp', 'cp.to_user', '=', 'o.by_user')
            ->select([
                'o.id', 'o.date_added', 'o.date_shipped', 'o.date_paid', 'o.date_purchased',
                'o.by_user', 'o.total', 'o.total_vat', 'o.total_excluding_vat',
                'o.total_with_coupon', 'o.coupon',
                'o.payment_method', 'o.is_processed', 'o.is_shipped', 'o.is_paid',
                'o.ref', 'o.ref1', 'o.prod_id', 'o.subscription_id',
                'o.shipment_center', 'o.region_code', 'o.parcel_tracking_id',
                'o.is_pre_financed', 'o.company_name', 'o.origin',
                'o.cart', 'o.invoice_no', 'o.batch',
                DB::raw("CONCAT(cp.first_name, ' ', cp.last_name) as customer_name"),
                'cp.email as customer_email',
            ])
            ->where('o.id', $orderId)
            ->first();

        return $row ? (array) $row : null;
    }

    /**
     * @param int $orderId
     * @param int $customerId
     * @return array|null
     */
    public function findByIdAndCustomer(int $orderId, int $customerId): ?array
    {
        $row = DB::table('orders')->where('id', $orderId)->where('by_user', $customerId)->first();

        return $row ? (array) $row : null;
    }

    /**
     * Moves order from orders to orders_deleted within a transaction.
     *
     * @param int $orderId
     * @param string $cancelReason
     * @param string|null $cancelCategory
     * @param string|null $cancelReception
     * @return bool
     */
    public function cancel(int $orderId, string $cancelReason, ?string $cancelCategory, ?string $cancelReception): bool
    {
        $order = DB::table('orders')->where('id', $orderId)->first();
        if (!$order) {
            return false;
        }

        DB::transaction(function () use ($order, $cancelReason, $cancelCategory, $cancelReception) {
            // Guard — orders_deleted may not exist in all environments
            if (Schema::hasTable('orders_deleted')) {
                $row = (array) $order;

                // Remove auto-increment key to allow explicit insert
                $id = $row['id'];
                unset($row['id']);

                DB::table('orders_deleted')->insert(array_merge($row, [
                    'id'               => $id,
                    'date_deleted'     => now(),
                    'cancel_reason'    => $cancelReason,
                    'cancel_category'  => $cancelCategory,
                    'cancel_reception' => $cancelReception,
                ]));
            }

            DB::table('orders')->where('id', $order->id)->delete();
        });

        return true;
    }

    /**
     * @param int $orderId
     * @return Collection
     */
    public function getAdjustments(int $orderId): Collection
    {
        if (!Schema::hasTable('order_adjustments')) {
            return collect([]);
        }

        return DB::table('order_adjustments')
            ->where('order_id', $orderId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * @param array $data
     * @return array
     */
    public function createAdjustment(array $data): array
    {
        $id = DB::table('order_adjustments')->insertGetId(array_merge($data, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        $row = (array) DB::table('order_adjustments')->find($id);
        $row['amount'] = (float) ($row['amount'] ?? 0);
        return $row;
    }
}
