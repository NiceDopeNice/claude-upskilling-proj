<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Enums/InsuranceProduct.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Enums;

enum InsuranceProduct: string
{
    case IdProtect       = 'id-protect';
    case IdProtectSingle = 'id-protect-single';
    case IdProtectDuo    = 'id-protect-duo';
    case IdProtectFamily = 'id-protect-family';

    public function label(): string
    {
        return match ($this) {
            self::IdProtect       => 'ID Protect',
            self::IdProtectSingle => 'ID Protect Single',
            self::IdProtectDuo    => 'ID Protect Duo',
            self::IdProtectFamily => 'ID Protect Family',
        };
    }

    public static function all(): array
    {
        return array_map(static fn ($e) => $e->value, self::cases());
    }
}
