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
            'sex'                => ['sometimes', 'nullable', 'string', 'in:male,female,unknown'],
            'birthdate'          => ['sometimes', 'nullable', 'string', 'max:20'],
            'careof'             => ['sometimes', 'nullable', 'string', 'max:100'],
            'sync'               => ['sometimes', 'boolean'],
            'credit_check'       => ['sometimes', 'nullable', 'integer'],
            'payment_preference' => ['sometimes', 'nullable', 'string', 'in:autogiro,b-post,email,sms,paper, no fee,einvoice'],
            'delivery_method'    => ['sometimes', 'nullable', 'string', 'max:100'],
            'do_not_call'        => ['sometimes', 'boolean'],
            'difficult_customer' => ['sometimes', 'boolean'],
            'reminders'          => ['sometimes', 'boolean'],
            'block_email'         => ['sometimes', 'boolean'],
            'block_gdpr'          => ['sometimes', 'boolean'],
            'block_dm'            => ['sometimes', 'boolean'],
            'blocked_fees'        => ['sometimes', 'nullable', 'array'],
            'blocked_fees.*'      => ['string', 'max:50'],
            'household_adults'    => ['sometimes', 'nullable', 'integer', 'min:0'],
            'household_children'  => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}
