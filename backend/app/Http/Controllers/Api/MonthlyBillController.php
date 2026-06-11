<?php

namespace App\Http\Controllers\Api;

use App\Models\MonthlyBill;
use App\Models\PaymentType;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMonthlyBillRequest;
use App\Http\Requests\UpdateMonthlyBillRequest;

class MonthlyBillController extends Controller
{
    public function index(Request $request)
    {
        return MonthlyBill::with([
            'resident',
            'house',
            'paymentType'
        ])
            ->when($request->month, function ($q) use ($request) {
                $q->whereMonth('bill_month', date('m', strtotime($request->month)))
                    ->whereYear('bill_month', date('Y', strtotime($request->month)));
            })
            ->latest()
            ->paginate(20);
    }

    public function store(StoreMonthlyBillRequest $request)
    {
        $paymentType = PaymentType::findOrFail($request->payment_type_id);

        $bill = MonthlyBill::create([
            'resident_id' => $request->resident_id,
            'house_id' => $request->house_id,
            'payment_type_id' => $request->payment_type_id,
            'bill_month' => $request->bill_month,
            'amount' => $request->amount ?? $paymentType->default_amount,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Monthly bill created successfully',
            'data' => $bill->load(['resident', 'house', 'paymentType'])
        ], 201);
    }

    public function show($id)
    {
        return MonthlyBill::with([
            'resident',
            'house',
            'paymentType',
            'payments'
        ])->findOrFail($id);
    }

    public function update(UpdateMonthlyBillRequest $request, $id)
    {
        $bill = MonthlyBill::findOrFail($id);

        $bill->update($request->validated());

        return response()->json([
            'message' => 'Monthly bill updated successfully',
            'data' => $bill
        ]);
    }

    public function destroy($id)
    {
        MonthlyBill::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Monthly bill deleted successfully'
        ]);
    }

    public function report(Request $request)
    {
        $request->validate([
            'month' => ['nullable', 'date'],
        ]);

        $month = $request->month;

        $bills = MonthlyBill::with(['resident', 'house', 'paymentType'])  // tambah house
            ->when($month, function ($q) use ($month) {
                $q->whereMonth('bill_month', date('m', strtotime($month)))
                    ->whereYear('bill_month', date('Y', strtotime($month)));
            })
            ->get();

        $totalIncome = $bills->where('status', 'paid')->sum('amount');
        $totalPending = $bills->where('status', 'pending')->sum('amount');
        $totalPartial = $bills->where('status', 'partially_paid')->sum('amount'); // jangan lupa ini

        return response()->json([
            'month' => $month ?? 'all',
            'total_income' => $totalIncome,
            'total_pending' => $totalPending,
            'total_partially_paid' => $totalPartial,
            'bills_count' => $bills->count(),
            'bills' => $bills,
        ]);
    }
}
