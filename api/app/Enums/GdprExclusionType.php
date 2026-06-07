<?php

namespace App\Enums;

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
