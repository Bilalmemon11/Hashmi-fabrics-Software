<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerPayment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $customers = Customer::orderBy('name')->get();

        return $this->success($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'type' => 'nullable|in:retail,wholesale',
            'balance' => 'nullable|numeric|min:0',
            'total_purchase' => 'nullable|numeric|min:0',
        ]);

        $customer = Customer::create($validated);

        return $this->success($customer, 'Customer created', 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->load('invoices');

        return $this->success($customer);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'type' => 'nullable|in:retail,wholesale',
            'balance' => 'nullable|numeric|min:0',
            'total_purchase' => 'nullable|numeric|min:0',
        ]);

        $customer->update($validated);

        return $this->success($customer->fresh(), 'Customer updated');
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return $this->success(null, 'Customer deleted');
    }

    public function receivePayment(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'date' => 'nullable|date',
            'invoice_id' => 'nullable|exists:invoices,id',
        ]);

        $amount = (float) $validated['amount'];

        if ($amount > $customer->balance) {
            return $this->error('Payment amount exceeds customer balance');
        }

        $customer->decrement('balance', $amount);

        CustomerPayment::create([
            'customer_id' => $customer->id,
            'invoice_id' => $validated['invoice_id'] ?? null,
            'amount' => $amount,
            'date' => $validated['date'] ?? today(),
        ]);

        return $this->success($customer->fresh(), 'Payment received');
    }
}
