<?php

namespace App\Http\Controllers\Api;

use App\Models\House;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\MonthlyBill;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function summary()
    {
        $totalIncome = Payment::sum('amount');

        $totalExpense = Expense::sum('amount');

        $occupiedHouses = House::where(
            'occupancy_status',
            'occupied'
        )->count();

        $vacantHouses = House::where(
            'occupancy_status',
            'vacant'
        )->count();

        $unpaidBills = MonthlyBill::whereIn(
            'status',
            [
                'pending',
                'partially_paid'
            ]
        )->count();

        return response()->json([
            'total_income' => (float) $totalIncome,
            'total_expense' => (float) $totalExpense,
            'balance' => (float) ($totalIncome - $totalExpense),

            'occupied_houses' => $occupiedHouses,
            'vacant_houses' => $vacantHouses,

            'unpaid_bills' => $unpaidBills,
        ]);
    }

    public function monthlyReport(Request $request)
    {
        $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        $year = $request->year ?? now()->year;

        $result = [];

        for ($month = 1; $month <= 12; $month++) {

            $income = Payment::query()
                ->whereYear('payment_month', $year)
                ->whereMonth('payment_month', $month)
                ->sum('amount');

            $expense = Expense::query()
                ->whereYear('expense_date', $year)
                ->whereMonth('expense_date', $month)
                ->sum('amount');

            $result[] = [
                'month' => date(
                    'M',
                    mktime(0, 0, 0, $month, 1)
                ),
                'income' => (float) $income,
                'expense' => (float) $expense,
                'balance' => (float) ($income - $expense),
            ];
        }

        return response()->json([
            'year' => (int) $year,
            'data' => $result,
        ]);
    }
}
