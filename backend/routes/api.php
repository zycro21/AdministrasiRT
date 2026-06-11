<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\MonthlyBillController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentTypeController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\DashboardController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Residents
    Route::get('residents/stats', [ResidentController::class, 'stats']); 
    Route::get('residents/{resident}/detail', [ResidentController::class, 'detail']);
    Route::apiResource('residents', ResidentController::class);

    // Houses
    Route::apiResource('houses', HouseController::class);
    Route::get('houses/{house}/detail', [HouseController::class, 'detail']);
    Route::post('houses/{house}/assign-resident', [HouseController::class, 'assignResident']);
    Route::post('houses/{house}/replace-residents', [HouseController::class, 'replaceResidents']);

    // Monthly Bills
    Route::get('monthly-bills/report', [MonthlyBillController::class, 'report']);
    Route::apiResource('monthly-bills', MonthlyBillController::class);

    // Payments
    Route::apiResource('payments', PaymentController::class)->only([
        'index',
        'store',
        'show',
        'destroy',
    ]);

    // Payment Types
    Route::apiResource('payment-types', PaymentTypeController::class);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('summary', [DashboardController::class, 'summary']);
        Route::get('monthly-report', [DashboardController::class, 'monthlyReport']);
    });
});
