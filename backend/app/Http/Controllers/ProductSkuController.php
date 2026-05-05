<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductSku;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductSkuController extends Controller
{
    /** GET /api/products/{productId}/skus */
    public function index(int $productId)
    {
        $skus = ProductSku::where('product_id', $productId)->get();
        return response()->json($skus);
    }

    /** POST /api/products/{productId}/skus */
    public function store(Request $request, int $productId)
    {
        $product = Product::findOrFail($productId);

        $data = $request->validate([
            'sku_code' => ['required', 'string', 'max:100', 'unique:product_skus,sku_code'],
            'name' => ['required', 'string', 'max:200'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean']
        ]);

        $data['product_id'] = $product->id;
        $sku = ProductSku::create($data);

        return response()->json($sku, 201);
    }

    /** PUT /api/skus/{id} */
    public function update(Request $request, int $id)
    {
        $sku = ProductSku::findOrFail($id);

        $data = $request->validate([
            'sku_code' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('product_skus', 'sku_code')->ignore($sku->id)],
            'name' => ['sometimes', 'required', 'string', 'max:200'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean']
        ]);

        $sku->update($data);

        return response()->json($sku);
    }

    /** DELETE /api/skus/{id} */
    public function destroy(int $id)
    {
        $sku = ProductSku::findOrFail($id);
        $sku->delete();

        return response()->json(['message' => 'SKU deleted.']);
    }
}
