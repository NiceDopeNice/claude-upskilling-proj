<?php

namespace App\Http\Controllers;

use App\Models\CustomerChange;
use Illuminate\Http\JsonResponse;

class CustomerChangeController extends Controller
{
    public function index(int $customerId): JsonResponse
    {
        $changes = CustomerChange::with('initiator')
            ->where('change_user_id', $customerId)
            ->orderBy('change_date', 'desc')
            ->orderBy('change_id', 'desc')
            ->get();

        $grouped = $changes
            ->groupBy('change_batch_id')
            ->map(function ($batch) {
                $first = $batch->first();
                return [
                    'batch_id'   => $first->change_batch_id,
                    'action'     => $first->change_action,
                    'initiator'  => $first->initiator?->name,
                    'changed_at' => $first->change_date,
                    'fields'     => $batch->map(fn ($c) => [
                        'field'     => $c->change_field,
                        'old_value' => $c->change_old_value,
                        'new_value' => $c->change_new_value,
                    ])->values(),
                ];
            })
            ->values();

        return response()->json(['data' => $grouped]);
    }
}
