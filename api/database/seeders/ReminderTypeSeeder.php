<?php

namespace Database\Seeders;

use App\Models\CustomerReminderType;
use Illuminate\Database\Seeder;

class ReminderTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'code'                    => 'brush_head',
                'label_en'                => 'Brush Head Refill',
                'label_sv'                => 'Påfyllning av borsthuv',
                'default_interval_months' => 3,
                'min_interval_months'     => 1,
                'max_interval_months'     => 12,
                'supported_brands'        => ['Dentle'],
                'status'                  => true,
            ],
            [
                'code'                    => 'supplement_refill',
                'label_en'                => 'Supplement Refill',
                'label_sv'                => 'Påfyllning av tillskott',
                'default_interval_months' => 1,
                'min_interval_months'     => 1,
                'max_interval_months'     => 6,
                'supported_brands'        => ['Grace', 'Zuave', 'Sinfrid'],
                'status'                  => true,
            ],
            [
                'code'                    => 'subscription_renewal',
                'label_en'                => 'Subscription Renewal',
                'label_sv'                => 'Prenumerationsförnyelse',
                'default_interval_months' => 12,
                'min_interval_months'     => 6,
                'max_interval_months'     => 24,
                'supported_brands'        => ['Dentle', 'Grace', 'Zuave', 'Sinfrid'],
                'status'                  => true,
            ],
            [
                'code'                    => 'follow_up',
                'label_en'                => 'Customer Follow-up',
                'label_sv'                => 'Kunduppföljning',
                'default_interval_months' => 6,
                'min_interval_months'     => 1,
                'max_interval_months'     => 12,
                'supported_brands'        => ['Dentle', 'Grace', 'Zuave', 'Sinfrid'],
                'status'                  => true,
            ],
        ];

        foreach ($types as $type) {
            CustomerReminderType::firstOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
