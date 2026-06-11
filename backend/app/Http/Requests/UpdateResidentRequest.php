<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => [
                'sometimes',
                'string',
                'max:255',
            ],

            'ktp_photo' => [
                'sometimes',
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048',
            ],

            'resident_status' => [
                'sometimes',
                'in:contract,permanent',
            ],

            'phone_number' => [
                'sometimes',
                'string',
                'max:20',
            ],

            'marital_status' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}
