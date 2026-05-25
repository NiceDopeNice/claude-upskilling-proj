<?php

/**
 * Upskilling Project
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'        => ['sometimes', 'string', 'max:64'],
            'last_name'         => ['sometimes', 'nullable', 'string', 'max:64'],
            'email'             => ['sometimes', 'nullable', 'email', 'max:64'],
            'alternative_email' => ['sometimes', 'nullable', 'email', 'max:64'],
            'tel'               => ['sometimes', 'nullable', 'string', 'max:20'],
            'alternative_tel'   => ['sometimes', 'nullable', 'string', 'max:20'],
            'pers_nr'           => ['sometimes', 'nullable', 'string', 'max:40'],
            'adress'            => ['sometimes', 'nullable', 'string', 'max:256'],
            'post_nr'           => ['sometimes', 'nullable', 'string', 'max:11'],
            'ort'               => ['sometimes', 'nullable', 'string', 'max:64'],
            'region_code'       => ['sometimes', 'nullable', 'string', 'size:2'],
            'do_not_call'       => ['sometimes', 'boolean'],
            'difficult_customer'=> ['sometimes', 'boolean'],
            'block_email'       => ['sometimes', 'boolean'],
            'block_gdpr'        => ['sometimes', 'boolean'],
            'block_dm'          => ['sometimes', 'boolean'],
        ];
    }
}
