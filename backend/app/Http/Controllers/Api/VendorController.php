<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorPayment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $vendors = Vendor::orderBy('name')->get();

        return $this->success($vendors);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'balance' => 'nullable|numeric|min:0',
            'total_purchase' => 'nullable|numeric|min:0',
        ]);

        $vendor = Vendor::create($validated);

        return $this->success($vendor, 'Vendor created', 201);
    }

    public function show(Vendor $vendor): JsonResponse
    {
        $vendor->load(['purchases', 'payments']);

        return $this->success($vendor);
    }

    public function update(Request $request, Vendor $vendor): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'balance' => 'nullable|numeric|min:0',
            'total_purchase' => 'nullable|numeric|min:0',
        ]);

        $vendor->update($validated);

        return $this->success($vendor->fresh(), 'Vendor updated');
    }

    public function destroy(Vendor $vendor): JsonResponse
    {
        $vendor->delete();

        return $this->success(null, 'Vendor deleted');
    }

    public function makePayment(Request $request, int $id): JsonResponse
    {
        $vendor = Vendor::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $amount = (float) $validated['amount'];

        if ($amount > $vendor->balance) {
            return $this->error('Payment amount exceeds vendor balance');
        }

        $vendor->decrement('balance', $amount);

        VendorPayment::create([
            'vendor_id' => $vendor->id,
            'amount' => $amount,
            'date' => $validated['date'] ?? today(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return $this->success($vendor->fresh(), 'Payment made');
    }
}
