<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FlagGdprCustomerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'customer_id'    => ['required', 'integer', 'min:1'],
            'exclusion_type' => ['required', 'string', 'in:2y_after_starter,subscription_end'],
        ];
    }
}
