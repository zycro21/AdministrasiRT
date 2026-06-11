<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'house_number' => [
                'required',
                'string',
                'max:50',
                'unique:houses,house_number',
            ],

            'address' => [
                'nullable',
                'string',
            ],

            'occupancy_status' => [
                'required',
                'in:occupied,vacant',
            ],
        ];
    }
}
