<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkGdprActionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'action'        => ['required', 'string', 'in:unflag,anonymize,restore,reject'],
            'customer_ids'  => ['required', 'array', 'min:1'],
            'customer_ids.*'=> ['required', 'integer', 'min:1'],
        ];
    }
}
