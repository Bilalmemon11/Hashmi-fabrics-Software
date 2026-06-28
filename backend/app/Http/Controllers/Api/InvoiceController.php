<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerPayment;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $invoices = Invoice::with('customer')
            ->latest()
            ->get()
            ->map(function ($invoice) {
                return [
                    ...$invoice->toArray(),
                    'customer_name' => $invoice->customer->name,
                ];
            });

        return $this->success($invoices);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'paid' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'payment_type' => 'required|in:cash,credit',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
        ]);

        try {
            $invoice = DB::transaction(function () use ($validated) {
                $count = Invoice::count() + 1;
                $invoiceNo = 'INV-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);

                $paid = (float) ($validated['paid'] ?? 0);
                $balance = (float) ($validated['balance'] ?? ($validated['total'] - $paid));

                $invoice = Invoice::create([
                    'invoice_no' => $invoiceNo,
                    'customer_id' => $validated['customer_id'],
                    'date' => $validated['date'],
                    'subtotal' => $validated['subtotal'],
                    'discount' => $validated['discount'] ?? 0,
                    'total' => $validated['total'],
                    'paid' => $paid,
                    'balance' => $balance,
                    'payment_type' => $validated['payment_type'],
                ]);

                foreach ($validated['items'] as $item) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'product_id' => $item['product_id'],
                        'qty' => $item['qty'],
                        'unit_price' => $item['unit_price'],
                        'total' => $item['total'],
                    ]);

                    Product::where('id', $item['product_id'])
                        ->decrement('stock_qty', $item['qty']);
                }

                $customer = Customer::find($validated['customer_id']);
                $customer->increment('balance', $balance);
                $customer->increment('total_purchase', $validated['total']);

                if ($paid > 0) {
                    CustomerPayment::create([
                        'customer_id' => $customer->id,
                        'invoice_id' => $invoice->id,
                        'amount' => $paid,
                        'date' => $validated['date'],
                    ]);
                }

                return $invoice;
            });

            $invoice->load(['items.product', 'customer']);

            return $this->success($invoice, 'Invoice created', 201);
        } catch (\Exception $e) {
            return $this->error('Failed to create invoice: ' . $e->getMessage(), 500);
        }
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['items.product', 'customer']);

        return $this->success($invoice);
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'sometimes|required|exists:customers,id',
            'date' => 'sometimes|required|date',
            'subtotal' => 'sometimes|required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'sometimes|required|numeric|min:0',
            'paid' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'payment_type' => 'sometimes|required|in:cash,credit',
        ]);

        $invoice->update($validated);

        return $this->success($invoice->fresh()->load(['items.product', 'customer']), 'Invoice updated');
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        if (!$invoice->date->isToday()) {
            return $this->error('Only same-day invoices can be deleted');
        }

        try {
            DB::transaction(function () use ($invoice) {
                foreach ($invoice->items as $item) {
                    Product::where('id', $item->product_id)
                        ->increment('stock_qty', $item->qty);
                }

                $customer = $invoice->customer;
                $customer->decrement('balance', $invoice->balance);
                $customer->decrement('total_purchase', $invoice->total);

                $invoice->delete();
            });

            return $this->success(null, 'Invoice deleted');
        } catch (\Exception $e) {
            return $this->error('Failed to delete invoice: ' . $e->getMessage(), 500);
        }
    }
}
