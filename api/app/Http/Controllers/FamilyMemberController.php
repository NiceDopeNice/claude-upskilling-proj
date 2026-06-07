<?php

namespace App\Http\Controllers;

use App\Http\Resources\FamilyMemberResource;
use App\Models\FamilyMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FamilyMemberController extends Controller
{
    public function index(int $customerId): AnonymousResourceCollection
    {
        $members = FamilyMember::where('customer_id', $customerId)
            ->orderBy('created_at', 'asc')
            ->get();

        return FamilyMemberResource::collection($members);
    }

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

    public function destroy(int $customerId, int $id): JsonResponse
    {
        $member = FamilyMember::where('customer_id', $customerId)->findOrFail($id);
        $member->delete();

        return response()->json(['message' => 'Family member removed.']);
    }
}
