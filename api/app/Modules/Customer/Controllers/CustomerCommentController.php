<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/CustomerCommentController.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Customer\Models\CustomerComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerCommentController extends Controller
{
    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function index(int $customerId): JsonResponse
    {
        $comments = CustomerComment::where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $comments]);
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @return JsonResponse
     */
    public function store(Request $request, int $customerId): JsonResponse
    {
        $data = $request->validate([
            'message'   => ['required', 'string'],
            'brand'     => ['nullable', 'string', 'max:100'],
            'initiator' => ['nullable', 'string', 'max:100'],
        ]);

        $comment = CustomerComment::create(['customer_id' => $customerId, ...$data]);

        return response()->json(['message' => 'Comment added successfully', 'data' => $comment], 201);
    }

    /**
     * @param Request $request
     * @param int $customerId
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $customerId, int $id): JsonResponse
    {
        $comment = CustomerComment::where('customer_id', $customerId)->findOrFail($id);

        $data = $request->validate([
            'message'   => ['sometimes', 'required', 'string'],
            'brand'     => ['sometimes', 'nullable', 'string', 'max:100'],
            'initiator' => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        $comment->update($data);

        return response()->json(['message' => 'Comment updated successfully', 'data' => $comment]);
    }

    /**
     * @param int $customerId
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $customerId, int $id): JsonResponse
    {
        CustomerComment::where('customer_id', $customerId)->findOrFail($id)->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
