<?php

namespace App\Enums;

enum SinfridAccountType: string
{
    case Single   = 'SINGLE';
    case Family   = 'FAMILY';
    case Duo      = 'DUO';
    case Business = 'BUSINESS';

    public function label(): string
    {
        return match ($this) {
            self::Single   => 'Single',
            self::Family   => 'Family',
            self::Duo      => 'Duo',
            self::Business => 'Business',
        };
    }

    public static function all(): array
    {
        return array_map(static fn ($e) => $e->value, self::cases());
    }
}
