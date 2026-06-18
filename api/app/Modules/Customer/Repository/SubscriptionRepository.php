<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/SubscriptionRepository.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Repository;

use App\Modules\Customer\Repository\Contracts\SubscriptionRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SubscriptionRepository implements SubscriptionRepositoryInterface
{
    /**
     * @param int $subId
     * @return array|null
     */
    public function findById(int $subId): ?array
    {
        // Check active subscriptions first, then deleted
        $row = DB::table('subscriptions')->where('id', $subId)->first();

        if (!$row && Schema::hasTable('subscriptions_deleted')) {
            $userCol = Schema::hasColumn('subscriptions_deleted', 'user_id') ? 'user_id' : 'by_user';
            $row = DB::table('subscriptions_deleted')->where('id', $subId)->first();
        }

        return $row ? (array) $row : null;
    }

    /**
     * @param int $subId
     * @param string $nextShipment
     * @return bool
     */
    public function updateNextShipment(int $subId, string $nextShipment): bool
    {
        return (bool) DB::table('subscriptions')
            ->where('id', $subId)
            ->where('active', 1)
            ->update(['next_shipment' => $nextShipment]);
    }

    /**
     * @param int $subId
     * @param string $cancelReason
     * @param string|null $cancelMethod
     * @param string|null $cancelCategory
     * @return bool
     */
    public function deactivate(int $subId, string $cancelReason, ?string $cancelMethod, ?string $cancelCategory): bool
    {
        $updated = DB::table('subscriptions')
            ->where('id', $subId)
            ->where('active', 1)
            ->update([
                'active'          => 0,
                'cancel_reason'   => $cancelReason,
                'cancel_method'   => $cancelMethod,
                'cancel_category' => $cancelCategory,
                'date_cancelled'  => now(),
            ]);

        return (bool) $updated;
    }

    /**
     * @param int $subId
     * @return int
     */
    public function countPreFinancedOrders(int $subId): int
    {
        if (!Schema::hasTable('orders')) {
            return 0;
        }

        return (int) DB::table('orders')
            ->where('subscription_id', $subId)
            ->where('is_pre_financed', 1)
            ->count();
    }
}
