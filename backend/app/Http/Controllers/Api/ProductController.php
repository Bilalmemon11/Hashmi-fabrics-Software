<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $products = Product::orderBy('name')->get();

        return $this->success($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'stock_qty' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'reorder_level' => 'nullable|integer|min:0',
        ]);

        $product = Product::create($validated);

        return $this->success($product, 'Product created', 201);
    }

    public function show(Product $product): JsonResponse
    {
        return $this->success($product);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'cost_price' => 'sometimes|required|numeric|min:0',
            'stock_qty' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'reorder_level' => 'nullable|integer|min:0',
        ]);

        $product->update($validated);

        return $this->success($product->fresh(), 'Product updated');
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return $this->success(null, 'Product deleted');
    }
}
