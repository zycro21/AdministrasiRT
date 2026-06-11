<?php

namespace App\Http\Controllers\Api;

use App\Models\PaymentType;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentTypeRequest;
use App\Http\Requests\UpdatePaymentTypeRequest;

class PaymentTypeController extends Controller
{
    public function index()
    {
        return PaymentType::latest()->paginate(request('per_page', 20));
    }

    public function store(StorePaymentTypeRequest $request)
    {
        $paymentType = PaymentType::create($request->validated());

        return response()->json([
            'message' => 'Payment type created successfully',
            'data' => $paymentType
        ], 201);
    }

    public function show($id)
    {
        return PaymentType::findOrFail($id);
    }

    public function update(UpdatePaymentTypeRequest $request, $id)
    {
        $paymentType = PaymentType::findOrFail($id);
        $paymentType->update($request->validated());

        return response()->json([
            'message' => 'Payment type updated successfully',
            'data' => $paymentType
        ]);
    }

    public function destroy($id)
    {
        $paymentType = PaymentType::findOrFail($id);

        // optional safety guard (biar tidak hapus yang sudah dipakai)
        if ($paymentType->payments()->exists() || $paymentType->monthlyBills()->exists()) {
            return response()->json([
                'message' => 'Payment type sudah digunakan, tidak bisa dihapus'
            ], 400);
        }

        $paymentType->delete();

        return response()->json([
            'message' => 'Payment type deleted successfully'
        ]);
    }
}
