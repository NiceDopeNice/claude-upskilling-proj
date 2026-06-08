<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/Contracts/GdprCustomerRepositoryInterface.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Repository\Contracts;

use App\Modules\Customer\Models\GdprCustomer;
use Illuminate\Pagination\LengthAwarePaginator;

interface GdprCustomerRepositoryInterface
{
    /**
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function listing(array $params): LengthAwarePaginator;

    /**
     * @param int $customerId
     * @return GdprCustomer|null
     */
    public function findByCustomerId(int $customerId): ?GdprCustomer;

    /**
     * @param array $data
     * @return GdprCustomer
     */
    public function create(array $data): GdprCustomer;

    /**
     * @param GdprCustomer $record
     * @param array $data
     * @return bool
     */
    public function update(GdprCustomer $record, array $data): bool;

    /**
     * @param GdprCustomer $record
     * @return bool
     */
    public function delete(GdprCustomer $record): bool;
}
