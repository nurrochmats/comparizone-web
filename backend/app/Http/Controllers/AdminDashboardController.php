<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Attribute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function index()
    {
        $totalProducts = Product::count();
        $totalCategories = Category::count();
        $totalAttributes = Attribute::count();
        
        // Count total clicks from events table
        $totalClicks = DB::table('marketing.events')
            ->where('event_type', 'click')
            ->count();

        $latestProducts = Product::with(['category', 'affiliateLinks'])
            ->withCount('affiliateLinks')
            ->latest()
            ->take(5)
            ->get();

        // Map latest products to include click counts
        $latestProductsData = $latestProducts->map(function ($product) {
            $clicks = DB::table('marketing.events')
                ->where('event_type', 'click')
                ->where('metadata->product_id', $product->id)
                ->count();
            
            $resource = new \App\Http\Resources\ProductResource($product);
            $data = $resource->toArray(request());
            $data['clicks_count'] = $clicks;
            
            return $data;
        });

        return response()->json([
            'data' => [
                'total_products' => $totalProducts,
                'total_categories' => $totalCategories,
                'total_attributes' => $totalAttributes,
                'total_clicks' => $totalClicks,
                'latest_products' => $latestProductsData,
            ]
        ]);
    }
}
