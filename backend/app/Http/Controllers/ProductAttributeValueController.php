<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductAttributeValue;
use Illuminate\Http\Request;

class ProductAttributeValueController extends Controller
{
    /** GET /api/products/{product}/attribute-values */
    public function index(int $product)
    {
        Product::findOrFail($product);

        $values = ProductAttributeValue::with(['attribute', 'option'])
            ->where('product_id', $product)
            ->get();

        return response()->json($values);
    }

    /** POST /api/products/{product}/attribute-values — admin only */
    public function store(Request $request, int $product)
    {
        Product::findOrFail($product);

        $data = $request->validate([
            'attribute_id' => ['required', 'integer', 'exists:attributes,id'],
            'value_option_id' => ['nullable', 'integer', 'exists:attribute_options,id'],
            'value_text' => ['nullable', 'string'],
            'value_number' => ['nullable', 'numeric'],
            'value_boolean' => ['nullable', 'boolean'],
            'sku_id' => ['nullable', 'integer', 'exists:product_skus,id'],
        ]);

        $data['product_id'] = $product;

        $value = ProductAttributeValue::create($data);

        return response()->json($value->load(['attribute', 'option']), 201);
    }

    /** PUT /api/products/{product}/attribute-values/{value} — admin only */
    public function update(Request $request, int $product, int $value)
    {
        $pav = ProductAttributeValue::where('product_id', $product)->findOrFail($value);

        $data = $request->validate([
            'value_option_id' => ['nullable', 'integer', 'exists:attribute_options,id'],
            'value_text' => ['nullable', 'string'],
            'value_number' => ['nullable', 'numeric'],
            'value_boolean' => ['nullable', 'boolean'],
            'sku_id' => ['nullable', 'integer', 'exists:product_skus,id'],
        ]);

        $pav->update($data);

        return response()->json($pav->fresh(['attribute', 'option']));
    }

    /** DELETE /api/products/{product}/attribute-values/{value} — admin only */
    public function destroy(int $product, int $value)
    {
        $pav = ProductAttributeValue::where('product_id', $product)->findOrFail($value);
        $pav->delete();

        return response()->json(['message' => 'Attribute value deleted.']);
    }
}
