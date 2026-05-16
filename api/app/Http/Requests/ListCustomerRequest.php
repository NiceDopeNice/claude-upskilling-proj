<?php

/**
 * Upskilling Project
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search'    => ['nullable', 'string', 'max:255'],
            'field'     => ['nullable', 'string', 'in:name,customer_no,email,tel,pers_nr,adress,alternative_email'],
            'fields'    => ['nullable', 'array'],
            'fields.*'  => ['nullable', 'string', 'in:name,customer_no,email,tel,pers_nr,adress,alternative_email'],
            'filters'   => ['nullable', 'array'],
            'filters.*' => ['nullable', 'string', 'max:255'],
            'per_page'  => ['nullable', 'integer', 'in:50,100,200,500'],
            'page'      => ['nullable', 'integer', 'min:1'],
        ];
    }
}
