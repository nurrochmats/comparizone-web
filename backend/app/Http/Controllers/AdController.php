<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdController extends Controller
{
    /**
     * GET /api/ads?placement=homepage_top
     * Public: returns only active ads in window, optionally filtered by placement.
     */
    public function index(Request $request): JsonResponse
    {
        $placement = $request->query('placement');
        $ads = Ad::active($placement)->get();
        return response()->json(['data' => $ads]);
    }

    /**
     * GET /api/admin/ads — full list including inactive
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');

        $query = Ad::orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('placement', 'like', "%{$search}%");
            });
        }

        $ads = $query->paginate($perPage);
        return response()->json($ads);
    }

    /**
     * POST /api/admin/ads
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'placement'  => 'required|in:' . implode(',', Ad::$placements),
            'image_url'  => 'required|url|max:2048',
            'target_url' => 'required|url|max:2048',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'is_active'  => 'sometimes|boolean',
        ]);

        $ad = Ad::create($validated);
        return response()->json(['data' => $ad], 201);
    }

    /**
     * PUT /api/admin/ads/{ad}
     */
    public function update(Request $request, Ad $ad): JsonResponse
    {
        $validated = $request->validate([
            'title'      => 'sometimes|string|max:255',
            'placement'  => 'sometimes|in:' . implode(',', Ad::$placements),
            'image_url'  => 'sometimes|url|max:2048',
            'target_url' => 'sometimes|url|max:2048',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'is_active'  => 'sometimes|boolean',
        ]);

        $ad->update($validated);
        return response()->json(['data' => $ad]);
    }

    /**
     * DELETE /api/admin/ads/{ad}
     */
    public function destroy(Ad $ad): JsonResponse
    {
        $ad->delete();
        return response()->json(null, 204);
    }
}
