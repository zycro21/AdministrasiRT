<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        return Expense::query()
            ->when($request->month, function ($q) use ($request) {
                $q->whereMonth('expense_date', date('m', strtotime($request->month)))
                    ->whereYear('expense_date', date('Y', strtotime($request->month)));
            })
            ->latest()
            ->paginate(20);
    }

    public function store(StoreExpenseRequest $request)
    {
        $expense = Expense::create($request->validated());

        return response()->json([
            'message' => 'Expense created successfully',
            'data' => $expense
        ], 201);
    }

    public function show($id)
    {
        return Expense::findOrFail($id);
    }

    public function update(UpdateExpenseRequest $request, $id)
    {
        $expense = Expense::findOrFail($id);
        $expense->update($request->validated());

        return response()->json([
            'message' => 'Expense updated successfully',
            'data' => $expense
        ]);
    }

    public function destroy($id)
    {
        Expense::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Expense deleted successfully'
        ]);
    }
}
