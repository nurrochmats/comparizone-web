<?php

namespace App\Http\Controllers;

use App\Models\AffiliateLink;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AffiliateLinkController extends Controller
{
    /**
     * GET /api/products/{product}/affiliate-links
     */
    public function index(Product $product): JsonResponse
    {
        $links = $product->affiliateLinks()->orderBy('store_name')->get();
        return response()->json(['data' => $links]);
    }

    /**
     * GET /api/admin/affiliate-links
     * Returns all affiliate links (with product context) for the admin panel.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 10), 100);
        $search = $request->input('search');

        $query = AffiliateLink::with('product:id,name')->orderBy('id', 'desc');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereRaw('LOWER(store_name) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereHas('product', function($pq) use ($search) {
                      $pq->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%']);
                  });
            });
        }

        $links = $query->paginate($perPage);
        return response()->json($links);
    }

    /**
     * POST /api/products/{product}/affiliate-links
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'store_name'      => 'required|string|max:100',
            'affiliate_url'   => 'required|url|max:2048',
            'commission_note' => 'nullable|string|max:255',
            'is_active'       => 'sometimes|boolean',
        ]);

        $link = $product->affiliateLinks()->create($validated);
        return response()->json(['data' => $link], 201);
    }

    /**
     * PUT /api/affiliate-links/{affiliateLink}
     */
    public function update(Request $request, AffiliateLink $affiliateLink): JsonResponse
    {
        $validated = $request->validate([
            'store_name'      => 'sometimes|string|max:100',
            'affiliate_url'   => 'sometimes|url|max:2048',
            'commission_note' => 'nullable|string|max:255',
            'is_active'       => 'sometimes|boolean',
        ]);

        $affiliateLink->update($validated);
        return response()->json(['data' => $affiliateLink]);
    }

    /**
     * DELETE /api/affiliate-links/{affiliateLink}
     */
    public function destroy(AffiliateLink $affiliateLink): JsonResponse
    {
        $affiliateLink->delete();
        return response()->json(null, 204);
    }
}
