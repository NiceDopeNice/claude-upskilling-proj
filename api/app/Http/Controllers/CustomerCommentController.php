<?php

namespace App\Http\Controllers;

use App\Models\CustomerComment;
use App\Models\CustomerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerCommentController extends Controller
{
    public function index(int $customerId): JsonResponse
    {
        $comments = CustomerComment::where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, int $customerId): JsonResponse
    {
        $data = $request->validate([
            'message'   => ['required', 'string'],
            'brand'     => ['nullable', 'string', 'max:100'],
            'initiator' => ['nullable', 'string', 'max:100'],
        ]);

        $comment = CustomerComment::create([
            'customer_id' => $customerId,
            ...$data,
        ]);

        return response()->json(['data' => $comment], 201);
    }

    public function update(Request $request, int $customerId, int $id): JsonResponse
    {
        $comment = CustomerComment::where('customer_id', $customerId)->findOrFail($id);

        $data = $request->validate([
            'message'   => ['sometimes', 'required', 'string'],
            'brand'     => ['sometimes', 'nullable', 'string', 'max:100'],
            'initiator' => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        $comment->update($data);

        return response()->json(['data' => $comment]);
    }

    public function destroy(int $customerId, int $id): JsonResponse
    {
        $comment = CustomerComment::where('customer_id', $customerId)->findOrFail($id);
        $comment->delete();

        return response()->json(null, 204);
    }
}
