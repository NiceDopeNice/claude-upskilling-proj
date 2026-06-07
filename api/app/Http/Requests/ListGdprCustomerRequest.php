<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListGdprCustomerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'search'         => ['nullable', 'string', 'max:200'],
            'status'         => ['nullable', 'string', 'in:flagged,pending_review,anonymized,restored,rejected'],
            'exclusion_type' => ['nullable', 'string', 'in:2y_after_starter,subscription_end'],
            'per_page'       => ['nullable', 'integer', 'min:1', 'max:200'],
            'page'           => ['nullable', 'integer', 'min:1'],
        ];
    }
}
