<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Vendor;
use App\Models\VendorPayment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $purchases = Purchase::with('vendor')
            ->latest()
            ->get()
            ->map(function ($purchase) {
                return [
                    ...$purchase->toArray(),
                    'vendor_name' => $purchase->vendor->name,
                ];
            });

        return $this->success($purchases);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'date' => 'required|date',
            'items_description' => 'nullable|string',
            'total' => 'required|numeric|min:0',
            'paid' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
        ]);

        try {
            $purchase = DB::transaction(function () use ($validated) {
                $count = Purchase::count() + 1;
                $poNo = 'PUR-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);

                $paid = (float) ($validated['paid'] ?? 0);
                $balance = (float) ($validated['balance'] ?? ($validated['total'] - $paid));

                $purchase = Purchase::create([
                    'po_no' => $poNo,
                    'vendor_id' => $validated['vendor_id'],
                    'date' => $validated['date'],
                    'items_description' => $validated['items_description'] ?? null,
                    'total' => $validated['total'],
                    'paid' => $paid,
                    'balance' => $balance,
                ]);

                $vendor = Vendor::find($validated['vendor_id']);
                $vendor->increment('balance', $balance);
                $vendor->increment('total_purchase', $validated['total']);

                if ($paid > 0) {
                    VendorPayment::create([
                        'vendor_id' => $vendor->id,
                        'amount' => $paid,
                        'date' => $validated['date'],
                        'notes' => 'Payment on purchase ' . $poNo,
                    ]);
                }

                return $purchase;
            });

            $purchase->load('vendor');

            return $this->success($purchase, 'Purchase created', 201);
        } catch (\Exception $e) {
            return $this->error('Failed to create purchase: ' . $e->getMessage(), 500);
        }
    }

    public function show(Purchase $purchase): JsonResponse
    {
        $purchase->load('vendor');

        return $this->success($purchase);
    }

    public function update(Request $request, Purchase $purchase): JsonResponse
    {
        $validated = $request->validate([
            'vendor_id' => 'sometimes|required|exists:vendors,id',
            'date' => 'sometimes|required|date',
            'items_description' => 'nullable|string',
            'total' => 'sometimes|required|numeric|min:0',
            'paid' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
        ]);

        $purchase->update($validated);

        return $this->success($purchase->fresh()->load('vendor'), 'Purchase updated');
    }

    public function destroy(Purchase $purchase): JsonResponse
    {
        $purchase->delete();

        return $this->success(null, 'Purchase deleted');
    }
}
