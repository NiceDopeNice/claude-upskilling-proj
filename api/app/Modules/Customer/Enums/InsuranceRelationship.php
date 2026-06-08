<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Enums/InsuranceRelationship.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Enums;

enum InsuranceRelationship: string
{
    case Self        = 'self';
    case Spouse      = 'spouse';
    case Child       = 'child';
    case Parent      = 'parent';
    case Sibling     = 'sibling';
    case Grandparent = 'grandparent';
    case Grandchild  = 'grandchild';
    case Friend      = 'friend';
    case Other       = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Self        => 'Self',
            self::Spouse      => 'Spouse',
            self::Child       => 'Child',
            self::Parent      => 'Parent',
            self::Sibling     => 'Sibling',
            self::Grandparent => 'Grandparent',
            self::Grandchild  => 'Grandchild',
            self::Friend      => 'Friend',
            self::Other       => 'Other',
        };
    }

    public static function all(): array
    {
        return array_map(static fn ($e) => $e->value, self::cases());
    }
}
