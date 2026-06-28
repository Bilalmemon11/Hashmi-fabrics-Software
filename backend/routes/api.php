<?php

use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\VendorController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('products', ProductController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('vendors', VendorController::class);
    Route::apiResource('invoices', InvoiceController::class);
    Route::apiResource('purchases', PurchaseController::class);
    Route::apiResource('expenses', ExpenseController::class);

    Route::post('customers/{id}/receive-payment', [CustomerController::class, 'receivePayment']);
    Route::post('vendors/{id}/pay', [VendorController::class, 'makePayment']);

    Route::get('reports/profit-loss', [ReportController::class, 'profitLoss']);
    Route::get('reports/monthly-sales', [ReportController::class, 'monthlySales']);
});
