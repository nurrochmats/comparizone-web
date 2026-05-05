<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /** GET /api/products — public listing */
    public function index(Request $request)
    {
        $perPage = min($request->integer('per_page', 20), 100);
        $search = $request->input('search');

        $query = Product::with('category')
            ->withCount(['affiliateLinks', 'images'])
            ->where('is_active', true);

        if ($search) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%']);
        }

        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    /** GET /api/admin/products — admin listing including inactive */
    public function adminIndex(Request $request)
    {
        $perPage = min($request->integer('per_page', 10), 100);
        $search = $request->input('search');

        $query = Product::with('category')
            ->withCount(['affiliateLinks', 'images'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%']);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    /** GET /api/products/{slug} — public */
    public function show(string $slug)
    {
        $product = Product::with([
            'category',
            'skus',
            'productAttributeValues.attribute',
            'productAttributeValues.option',
            'images',
            'affiliateLinks',
        ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return new \App\Http\Resources\CompareResource($product);
    }

    /** POST /api/products — admin only */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200', 'unique:products,slug'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url'],
            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0', 'gte:price_min'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $product = Product::create($data);

        return (new ProductResource($product->load('category')))->response()->setStatusCode(201);
    }

    /** PUT /api/products/{id} — admin only */
    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:200'],
            'slug' => ['sometimes', 'string', 'max:200', 'unique:products,slug,' . $id],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'brand' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url'],
            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $product->update($data);

        return new ProductResource($product->fresh('category'));
    }

    /** DELETE /api/products/{id} — admin only */
    public function destroy(int $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted.'], 200);
    }
}
