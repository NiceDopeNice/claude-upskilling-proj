<?php

namespace App\Http\Controllers;

use App\Models\CustomerReminder;
use App\Models\CustomerReminderType;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerReminderController extends Controller
{
    public function types(): JsonResponse
    {
        $types = CustomerReminderType::where('status', true)->get();
        return response()->json(['data' => $types]);
    }

    public function index(int $customerId): JsonResponse
    {
        $reminders = CustomerReminder::where('customer_id', $customerId)
            ->with('type')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $reminders]);
    }

    public function store(Request $request, int $customerId): JsonResponse
    {
        $data = $request->validate([
            'type_code'        => ['required', 'string', 'exists:customer_reminder_types,code'],
            'brand'            => ['required', 'string', 'max:50'],
            'send_sms'         => ['boolean'],
            'send_email'       => ['boolean'],
            'interval_months'  => ['required', 'integer', 'min:1', 'max:24'],
            'start_date'       => ['required', 'date'],
        ]);

        $reminder = CustomerReminder::updateOrCreate(
            [
                'customer_id' => $customerId,
                'type_code'   => $data['type_code'],
                'brand'       => $data['brand'],
            ],
            [
                'send_sms'             => $data['send_sms'] ?? true,
                'send_email'           => $data['send_email'] ?? true,
                'interval_months'      => $data['interval_months'],
                'start_date'           => $data['start_date'],
                'next_reminder_at'     => $this->computeNextReminderAt($data['start_date'], $data['interval_months']),
                'is_active'            => true,
                'deactivated_at'       => null,
                'deactivated_reason'   => null,
                'consecutive_failures' => 0,
                'created_by'           => 0,
            ]
        );

        return response()->json(['data' => $reminder->load('type')], 201);
    }

    public function deactivate(Request $request, int $customerId, int $id): JsonResponse
    {
        $reminder = CustomerReminder::where('customer_id', $customerId)->findOrFail($id);

        $data = $request->validate([
            'reason' => ['required', 'in:agent,customer_sms_stop,customer_email_unsubscribe,subscription_churn,gdpr_flag,contact_unreachable'],
        ]);

        $reminder->update([
            'is_active'          => false,
            'deactivated_at'     => now(),
            'deactivated_reason' => $data['reason'],
        ]);

        return response()->json(['data' => $reminder->load('type')]);
    }

    public function sends(int $customerId, int $id): JsonResponse
    {
        $reminder = CustomerReminder::where('customer_id', $customerId)->findOrFail($id);

        $sends = $reminder->sends()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json(['data' => $sends]);
    }

    private function computeNextReminderAt(string $startDate, int $intervalMonths, ?string $lastSentAt = null): string
    {
        $start  = Carbon::parse($startDate);
        $today  = Carbon::today();
        $anchor = $today;

        if ($lastSentAt) {
            $sent   = Carbon::parse($lastSentAt);
            $anchor = $sent->greaterThan($today) ? $sent : $today;
        } elseif ($start->greaterThan($today)) {
            return $start->toDateString();
        }

        $n    = 0;
        $next = $start->copy()->addMonths($n * $intervalMonths);
        while ($next->lessThanOrEqualTo($anchor)) {
            $n++;
            $next = $start->copy()->addMonths($n * $intervalMonths);
        }

        return $next->toDateString();
    }
}
