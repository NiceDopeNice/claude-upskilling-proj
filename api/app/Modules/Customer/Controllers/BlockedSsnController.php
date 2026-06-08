<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/BlockedSsnController.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Customer\Resources\BlockedSsnResource;
use App\Modules\Customer\Models\BlockedSsn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class BlockedSsnController extends Controller
{
    /**
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = BlockedSsn::query()->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ssn', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 25), 100);

        return BlockedSsnResource::collection($query->paginate($perPage));
    }

    /**
     * @param Request $request
     * @return BlockedSsnResource
     */
    public function store(Request $request): BlockedSsnResource
    {
        $data = $request->validate([
            'ssn'    => ['required', 'string', 'max:20', Rule::unique('blocked_ssns', 'ssn')],
            'reason' => ['nullable', 'string'],
        ]);

        $data['added_by'] = $request->input('added_by', 1111);

        $entry = BlockedSsn::create($data);

        return (new BlockedSsnResource($entry))->additional(['message' => 'SSN has been blocked successfully']);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $entry = BlockedSsn::findOrFail($id);
        $entry->delete();

        return response()->json(['message' => 'SSN has been unblocked successfully']);
    }
}

