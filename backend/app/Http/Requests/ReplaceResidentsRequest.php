<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReplaceResidentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resident_ids' => [
                'required',
                'array',
                'min:1',
            ],
            'resident_ids.*' => [
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
