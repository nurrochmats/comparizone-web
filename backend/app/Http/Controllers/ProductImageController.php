<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    /**
     * GET /api/products/{product}/images
     */
    public function index(Product $product): JsonResponse
    {
        $images = $product->images()->orderBy('sort_order')->get();
        return response()->json(['data' => $images]);
    }

    /**
     * GET /api/admin/product-images
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 20), 100);
        $images = ProductImage::with('product:id,name')->orderBy('id', 'desc')->paginate($perPage);
        return response()->json($images);
    }

    /**
     * POST /api/products/{product}/images
     * Accepts multipart/form-data with a "image" file field.
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,webp|max:2048',
            'is_primary' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $file = $request->file('image');
        $path = $file->store("products/{$product->id}", 'public');

        // If this image is marked as primary, demote any existing primary
        if ($request->boolean('is_primary', false)) {
            $product->images()->where('is_primary', true)->update(['is_primary' => false]);
        }

        $image = $product->images()->create([
            'image_url' => Storage::url($path),
            'is_primary' => $request->boolean('is_primary', false),
            'sort_order' => $request->integer('sort_order', 0),
        ]);

        return response()->json(['data' => $image], 201);
    }

    /**
     * PUT /api/products/{product}/images/{image}
     * Update sort_order or is_primary flag only (no re-upload).
     */
    public function update(Request $request, Product $product, ProductImage $image): JsonResponse
    {
        $validated = $request->validate([
            'is_primary' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        if (($validated['is_primary'] ?? false) === true) {
            $product->images()->where('is_primary', true)->update(['is_primary' => false]);
        }

        $image->update($validated);
        return response()->json(['data' => $image]);
    }

    /**
     * DELETE /api/products/{product}/images/{image}
     */
    public function destroy(Product $product, ProductImage $image): JsonResponse
    {
        // Remove physical file from storage
        $path = str_replace('/storage/', '', $image->image_url);
        Storage::disk('public')->delete($path);

        $image->delete();
        return response()->json(null, 204);
    }
}
