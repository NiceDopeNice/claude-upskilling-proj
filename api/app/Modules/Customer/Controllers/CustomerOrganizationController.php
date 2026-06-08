<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/CustomerOrganizationController.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Customer\Models\CustomerOrganization;
use App\Modules\Customer\Models\CustomerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrganizationController extends Controller
{
    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function show(int $customerId): JsonResponse
    {
        $customer = CustomerProfile::findOrFail($customerId);

        $org = $customer->organization_id
            ? CustomerOrganization::find($customer->organization_id)
            : null;

        return response()->json(['data' => $org]);
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @return JsonResponse
     */
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

        return response()->json(['message' => 'Organization updated successfully', 'data' => $org]);
    }
}
