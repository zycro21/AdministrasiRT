<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => [
                'required',
                'string',
                'max:255',
            ],

            'ktp_photo' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048',
            ],

            'resident_status' => [
                'required',
                'in:contract,permanent',
            ],

            'phone_number' => [
                'required',
                'string',
                'max:20',
            ],

            'marital_status' => [
                'required',
                'boolean',
            ],
        ];
    }
}
