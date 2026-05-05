<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Resources\CompareResource;
use Illuminate\Http\Request;

class CompareController extends Controller
{
    /**
     * Compare multiple products side-by-side.
     */
    public function compare(Request $request)
    {
        $request->validate([
            'products' => 'required|array|min:2|max:5',
            'products.*' => 'required|integer|exists:products,id',
        ]);

        $productIds = $request->input('products');
        $productsMap = Product::with([
            'category',
            'skus.attributeValues.attribute',
            'skus.attributeValues.option',
            'skus.affiliateLinks',
            'productAttributeValues.attribute',
            'productAttributeValues.option',
            'affiliateLinks',
        ])
            ->whereIn('id', $productIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        // Map back to the original order, allowing duplicates
        $products = collect($productIds)->map(function ($id) use ($productsMap) {
            return $productsMap->get($id);
        })->filter();

        return CompareResource::collection($products);
    }
}
