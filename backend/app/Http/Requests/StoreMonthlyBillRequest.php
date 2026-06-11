<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\HouseResident;

class StoreMonthlyBillRequest extends FormRequest
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
                // Cek apakah resident ini aktif di house yang dikirim
                function ($attribute, $value, $fail) {
                    $isActive = HouseResident::where('resident_id', $value)
                        ->where('house_id', $this->house_id)
                        ->where('is_active', true)
                        ->exists();

                    if (!$isActive) {
                        $fail('Resident ini tidak aktif di rumah yang dipilih.');
                    }
                },
            ],
            'house_id' => ['required', 'exists:houses,id'],
            'payment_type_id' => ['required', 'exists:payment_types,id'],
            'bill_month' => [
                'required',
                'date',
                Rule::unique('monthly_bills')->where(function ($query) {
                    return $query
                        ->where('resident_id', $this->resident_id)
                        ->where('house_id', $this->house_id)
                        ->where('payment_type_id', $this->payment_type_id);
                }),
            ],
            'notes' => ['nullable', 'string'],
        ];
    }
}
