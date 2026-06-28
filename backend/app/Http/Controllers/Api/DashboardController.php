<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Vendor;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $totalSales = Invoice::sum('total');
        $cashCollected = Invoice::sum('paid');
        $customerUdhar = Customer::sum('balance');
        $vendorPayable = Vendor::sum('balance');
        $totalExpenses = Expense::sum('amount');

        $lowStockProducts = Product::whereColumn('stock_qty', '<=', 'reorder_level')
            ->orderBy('name')
            ->get();

        $todaysInvoices = Invoice::with('customer')
            ->whereDate('date', today())
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($inv) => [
                'id' => $inv->id,
                'invoice_no' => $inv->invoice_no,
                'customer_name' => $inv->customer->name,
                'total' => $inv->total,
                'paid' => $inv->paid,
                'balance' => $inv->balance,
                'payment_type' => $inv->payment_type,
            ]);

        $recentInvoices = Invoice::with('customer')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($inv) => [
                'id' => $inv->id,
                'invoice_no' => $inv->invoice_no,
                'customer_name' => $inv->customer->name,
                'date' => $inv->date->format('Y-m-d'),
                'total' => $inv->total,
                'payment_type' => $inv->payment_type,
            ]);

        $vendorDues = Vendor::where('balance', '>', 0)
            ->orderByDesc('balance')
            ->get(['id', 'name', 'city', 'balance']);

        $customerDues = Customer::where('balance', '>', 0)
            ->orderByDesc('balance')
            ->get(['id', 'name', 'type', 'balance']);

        $expenseByCategory = Expense::selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        return $this->success([
            'total_sales' => (float) $totalSales,
            'cash_collected' => (float) $cashCollected,
            'customer_udhar' => (float) $customerUdhar,
            'vendor_payable' => (float) $vendorPayable,
            'total_expenses' => (float) $totalExpenses,
            'low_stock_products' => $lowStockProducts,
            'todays_invoices' => $todaysInvoices,
            'recent_invoices' => $recentInvoices,
            'vendor_dues' => $vendorDues,
            'customer_dues' => $customerDues,
            'expense_by_category' => $expenseByCategory,
        ]);
    }
}
