<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignResidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resident_id' => [
                'required',
                'exists:residents,id',
            ],

            'start_date' => [
                'required',
                'date',
            ],
        ];
    }
}
