<?php

namespace App\Http\Controllers\Api;

use App\Models\Payment;
use App\Models\MonthlyBill;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        return Payment::with([
            'resident',
            'house',
            'paymentType',
            'monthlyBill'
        ])->latest()->paginate(20);
    }

    public function store(StorePaymentRequest $request)
    {
        return DB::transaction(function () use ($request) {

            $bill = MonthlyBill::lockForUpdate()->findOrFail($request->monthly_bill_id);

            $totalPaid = $bill->payments()->sum('amount');
            $newTotal = $totalPaid + $request->amount;

            $payment = Payment::create([
                'monthly_bill_id' => $bill->id,
                'resident_id'     => $bill->resident_id,
                'house_id'        => $bill->house_id,
                'payment_type_id' => $bill->payment_type_id,
                'amount'          => $request->amount,
                'payment_month'   => $bill->bill_month,
                'paid_at'         => now(),
                'notes'           => $request->notes,
            ]);

            $bill->update([
                'status' => $newTotal >= $bill->amount ? 'paid' : 'partially_paid',
            ]);

            return response()->json([
                'message' => 'Payment berhasil',
                'data' => $payment->load(['monthlyBill', 'resident', 'house', 'paymentType']),
            ], 201);
        });
    }

    public function show($id)
    {
        return Payment::with([
            'resident',
            'house',
            'paymentType',
            'monthlyBill'
        ])->findOrFail($id);
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {

            $payment = Payment::findOrFail($id);
            $bill = $payment->monthlyBill;

            $payment->delete();

            $totalPaid = $bill->payments()->sum('amount');

            $bill->update([
                'status' => match (true) {
                    $totalPaid <= 0              => 'pending',
                    $totalPaid < $bill->amount   => 'partially_paid',
                    default                      => 'paid',
                }
            ]);

            return response()->json([
                'message' => 'Payment deleted successfully',
            ]);
        });
    }
}
