<?php

namespace App\Enums;

enum GdprStatus: string
{
    case Flagged       = 'flagged';
    case PendingReview = 'pending_review';
    case Anonymized    = 'anonymized';
    case Restored      = 'restored';
    case Rejected      = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::Flagged       => 'Flagged',
            self::PendingReview => 'Pending Review',
            self::Anonymized    => 'Anonymized',
            self::Restored      => 'Restored',
            self::Rejected      => 'Rejected',
        };
    }

    public function isLocked(): bool
    {
        return in_array($this, [self::PendingReview, self::Anonymized]);
    }
}
