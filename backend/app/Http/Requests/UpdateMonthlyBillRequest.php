<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMonthlyBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:pending,partially_paid,paid'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
