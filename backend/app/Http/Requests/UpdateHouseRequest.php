<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $house = $this->route('house');

        return [
            'house_number' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique(
                    'houses',
                    'house_number'
                )->ignore($house),
            ],

            'address' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'occupancy_status' => [
                'sometimes',
                'in:occupied,vacant',
            ],
        ];
    }
}
