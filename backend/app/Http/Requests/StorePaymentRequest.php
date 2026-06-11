<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\MonthlyBill;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'monthly_bill_id' => ['required', 'exists:monthly_bills,id'],
            'amount' => [
                'required',
                'numeric',
                'min:1',
                function ($attribute, $value, $fail) {
                    $bill = MonthlyBill::find($this->monthly_bill_id);

                    if (!$bill) return;

                    if ($bill->status === 'paid') {
                        $fail('Tagihan ini sudah lunas.');
                        return;
                    }

                    $totalPaid = $bill->payments()->sum('amount');
                    $remaining = $bill->amount - $totalPaid;

                    if ($value > $remaining) {
                        $fail("Jumlah pembayaran melebihi sisa tagihan (sisa: {$remaining}).");
                    }
                },
            ],
            'notes' => ['nullable', 'string'],
        ];
    }
}
