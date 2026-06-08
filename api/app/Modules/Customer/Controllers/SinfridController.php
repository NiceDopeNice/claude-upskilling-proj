<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/SinfridController.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Controllers;

use App\Modules\Customer\Enums\InsuranceProduct;
use App\Modules\Customer\Enums\InsuranceRelationship;
use App\Modules\Customer\Enums\SinfridAccountType;
use App\Http\Controllers\Controller;
use App\Modules\Customer\Resources\InsurancePolicyResource;
use App\Modules\Customer\Resources\SinfridAccountResource;
use App\Modules\Customer\Resources\SinfridAlarmResource;
use App\Modules\Customer\Resources\SinfridMemberResource;
use App\Modules\Customer\Models\InsurancePolicy;
use App\Modules\Customer\Models\SinfridAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SinfridController extends Controller
{
    /* ── Account ── */

    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function account(int $customerId): JsonResponse
    {
        $account = SinfridAccount::where('customer_id', $customerId)->first();

        return response()->json([
            'data' => $account ? new SinfridAccountResource($account) : null,
        ]);
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @return JsonResponse
     */
    public function updateAccount(Request $request, int $customerId): JsonResponse
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();

        $data = $request->validate([
            'type'            => ['sometimes', Rule::enum(SinfridAccountType::class)],
            'plan_id'         => ['sometimes', 'nullable', 'integer'],
            'first_name'      => ['sometimes', 'nullable', 'string', 'max:255'],
            'last_name'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'email'           => ['sometimes', 'nullable', 'email', 'max:255'],
            'email_confirmed' => ['sometimes', 'boolean'],
            'phone'           => ['sometimes', 'nullable', 'string', 'max:20'],
            'phone_confirmed' => ['sometimes', 'boolean'],
            'city'            => ['sometimes', 'nullable', 'string', 'max:64'],
            'street'          => ['sometimes', 'nullable', 'string', 'max:255'],
            'zipcode'         => ['sometimes', 'nullable', 'string', 'max:11'],
            'lang_code'       => ['sometimes', 'nullable', 'string', 'size:2'],
            'country_code'    => ['sometimes', 'string', 'size:2'],
            'status'          => ['sometimes', 'boolean'],
        ]);

        $account->update($data);

        return response()->json(['data' => new SinfridAccountResource($account)]);
    }

    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function deactivateAccount(int $customerId): JsonResponse
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();
        $account->update(['status' => false, 'deactivated_at' => now()]);
        return response()->json(['data' => new SinfridAccountResource($account)]);
    }

    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function reactivateAccount(int $customerId): JsonResponse
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();
        $account->update(['status' => true, 'deactivated_at' => null]);
        return response()->json(['data' => new SinfridAccountResource($account)]);
    }

    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function deleteAccount(int $customerId): JsonResponse
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();
        $account->delete();
        return response()->json(['message' => 'Account deleted.']);
    }

    /* ── Members ── */

    /**
     * @param int $customerId
     * @return AnonymousResourceCollection
     */
    public function members(int $customerId): AnonymousResourceCollection
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();

        return SinfridMemberResource::collection(
            $account->members()->orderBy('created_at')->get()
        );
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @return JsonResponse
     */
    public function addMember(Request $request, int $customerId): JsonResponse
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();

        $data = $request->validate([
            'ssn'          => ['nullable', 'string', 'max:50'],
            'first_name'   => ['required', 'string', 'max:255'],
            'last_name'    => ['nullable', 'string', 'max:255'],
            'email'        => ['nullable', 'email', 'max:255'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'city'         => ['nullable', 'string', 'max:64'],
            'street'       => ['nullable', 'string', 'max:255'],
            'zipcode'      => ['nullable', 'string', 'max:11'],
            'lang_code'    => ['nullable', 'string', 'size:2'],
            'country_code' => ['nullable', 'string', 'size:2'],
        ]);

        $member = $account->members()->create($data);

        return response()->json(['data' => new SinfridMemberResource($member)], 201);
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @param int $memberId
     * @return JsonResponse
     */
    public function updateMember(Request $request, int $customerId, int $memberId): JsonResponse
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();
        $member  = $account->members()->findOrFail($memberId);

        $data = $request->validate([
            'ssn'          => ['nullable', 'string', 'max:50'],
            'first_name'   => ['required', 'string', 'max:255'],
            'last_name'    => ['nullable', 'string', 'max:255'],
            'email'        => ['nullable', 'email', 'max:255'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'city'         => ['nullable', 'string', 'max:64'],
            'street'       => ['nullable', 'string', 'max:255'],
            'zipcode'      => ['nullable', 'string', 'max:11'],
            'lang_code'    => ['nullable', 'string', 'size:2'],
            'country_code' => ['nullable', 'string', 'size:2'],
        ]);

        $member->update($data);

        return response()->json(['data' => new SinfridMemberResource($member)]);
    }

    /**
     * @param int $customerId
     * @param int $memberId
     * @return JsonResponse
     */
    public function removeMember(int $customerId, int $memberId): JsonResponse
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();
        $member  = $account->members()->findOrFail($memberId);
        $member->delete();

        return response()->json(['message' => 'Member removed.']);
    }

    /* ── Alarms ── */

    /**
     * @param int $customerId
     * @return AnonymousResourceCollection
     */
    public function alarms(int $customerId): AnonymousResourceCollection
    {
        $account = SinfridAccount::where('customer_id', $customerId)->firstOrFail();

        return SinfridAlarmResource::collection(
            $account->alarms()->orderBy('date', 'desc')->get()
        );
    }

    /* ── Insurance Policies ── */

    /**
     * @param int $customerId
     * @return AnonymousResourceCollection
     */
    public function policies(int $customerId): AnonymousResourceCollection
    {
        return InsurancePolicyResource::collection(
            InsurancePolicy::where('customer_id', $customerId)
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @return JsonResponse
     */
    public function createPolicy(Request $request, int $customerId): JsonResponse
    {
        $data = $request->validate([
            'product'      => ['required', Rule::enum(InsuranceProduct::class)],
            'start_date'   => ['required', 'date'],
            'end_date'     => ['nullable', 'date'],
            'relationship' => ['nullable', Rule::enum(InsuranceRelationship::class)],
        ]);

        $policy = InsurancePolicy::create(array_merge($data, [
            'id'                => Str::random(22),
            'customer_id'       => $customerId,
            'partner_reference' => (string) $customerId,
            'status'            => 'ACTIVE',
            'source'            => 'manual',
        ]));

        return response()->json(['data' => new InsurancePolicyResource($policy)], 201);
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @param string $policyId
     * @return JsonResponse
     */
    public function cancelPolicy(Request $request, int $customerId, string $policyId): JsonResponse
    {
        $policy = InsurancePolicy::where('customer_id', $customerId)
            ->where('id', $policyId)
            ->whereIn('status', ['ACTIVE', 'PENDING'])
            ->firstOrFail();

        $policy->update(['status' => 'CANCELED']);

        return response()->json(['message' => 'Policy cancelled.', 'data' => new InsurancePolicyResource($policy->fresh())]);
    }
}

