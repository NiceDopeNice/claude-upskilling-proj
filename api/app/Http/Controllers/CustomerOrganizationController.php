<?php

namespace App\Http\Controllers;

use App\Models\CustomerOrganization;
use App\Models\CustomerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrganizationController extends Controller
{
    public function show(int $customerId): JsonResponse
    {
        $customer = CustomerProfile::findOrFail($customerId);

        $org = $customer->organization_id
            ? CustomerOrganization::find($customer->organization_id)
            : null;

        return response()->json(['data' => $org]);
    }

    public function upsert(Request $request, int $customerId): JsonResponse
    {
        $customer = CustomerProfile::findOrFail($customerId);

        $data = $request->validate([
            'id'            => ['required', 'string', 'max:64'],
            'name'          => ['nullable', 'string'],
            'contact_email' => ['nullable', 'email', 'max:100'],
            'invoice_email' => ['nullable', 'email', 'max:100'],
        ]);

        $org = CustomerOrganization::updateOrCreate(
            ['id' => $data['id']],
            [
                'name'          => $data['name'] ?? null,
                'contact_email' => $data['contact_email'] ?? null,
                'invoice_email' => $data['invoice_email'] ?? null,
            ]
        );

        $customer->organization_id = $org->id;
        $customer->save();

        return response()->json(['data' => $org]);
    }
}
