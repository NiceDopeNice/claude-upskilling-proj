<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/FamilyMemberController.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Customer\Resources\FamilyMemberResource;
use App\Modules\Customer\Models\FamilyMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FamilyMemberController extends Controller
{
    /**
     * @param int $customerId
     * @return AnonymousResourceCollection
     */
    public function index(int $customerId): AnonymousResourceCollection
    {
        $members = FamilyMember::where('customer_id', $customerId)
            ->orderBy('created_at', 'asc')
            ->get();

        return FamilyMemberResource::collection($members);
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @return FamilyMemberResource
     */
    public function store(Request $request, int $customerId): FamilyMemberResource
    {
        $data = $request->validate([
            'ssn'        => ['nullable', 'string', 'max:40'],
            'first_name' => ['required', 'string', 'max:64'],
            'last_name'  => ['nullable', 'string', 'max:64'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'email'      => ['nullable', 'email', 'max:64'],
            'street'     => ['nullable', 'string', 'max:256'],
            'zip_code'   => ['nullable', 'string', 'max:11'],
            'city'       => ['nullable', 'string', 'max:64'],
        ]);

        $member = FamilyMember::create(array_merge($data, ['customer_id' => $customerId]));

        return new FamilyMemberResource($member);
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @param int $id
     * @return FamilyMemberResource
     */
    public function update(Request $request, int $customerId, int $id): FamilyMemberResource
    {
        $member = FamilyMember::where('customer_id', $customerId)->findOrFail($id);

        $data = $request->validate([
            'ssn'        => ['nullable', 'string', 'max:40'],
            'first_name' => ['required', 'string', 'max:64'],
            'last_name'  => ['nullable', 'string', 'max:64'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'email'      => ['nullable', 'email', 'max:64'],
            'street'     => ['nullable', 'string', 'max:256'],
            'zip_code'   => ['nullable', 'string', 'max:11'],
            'city'       => ['nullable', 'string', 'max:64'],
        ]);

        $member->update($data);

        return new FamilyMemberResource($member);
    }

    /**
     * @param int $customerId
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $customerId, int $id): JsonResponse
    {
        $member = FamilyMember::where('customer_id', $customerId)->findOrFail($id);
        $member->delete();

        return response()->json(['message' => 'Family member removed.']);
    }
}

