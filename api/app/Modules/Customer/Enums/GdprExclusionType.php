<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Enums/GdprExclusionType.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Enums;

enum GdprExclusionType: string
{
    case TwoYearsAfterStarter = '2y_after_starter';
    case SubscriptionEnd      = 'subscription_end';

    public function label(): string
    {
        return match($this) {
            self::TwoYearsAfterStarter => 'Disable 2 years after last 1xx purchase',
            self::SubscriptionEnd      => 'When the subscription ends',
        };
    }
}
