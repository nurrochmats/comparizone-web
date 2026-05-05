<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\AttributeOptionController;
use App\Http\Controllers\ProductAttributeValueController;
use App\Http\Controllers\FilterController;
use App\Http\Controllers\CompareController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AffiliateLinkController;
use App\Http\Controllers\AdController;
use App\Http\Controllers\ProductImageController;

// ─── Authentication ────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// ─── Public Read Endpoints (throttled 10 req/min) ─────────────────────────
Route::middleware('throttle:100,1')->group(function () {

    // Categories — public listing & detail
    Route::get('/categories/nav', [CategoryController::class, 'topNav']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    // Products — public listing & detail
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Filter & Compare engine
    Route::post('/filter', [FilterController::class, 'filter']);
    Route::post('/compare', [CompareController::class, 'compare']);

    // Monetization — public reads ──
    Route::get('/ads', [AdController::class, 'index']);                                             // GET /api/ads?placement=homepage_top
    Route::get('/products/{product}/affiliate-links', [AffiliateLinkController::class, 'index']);   // GET /api/products/{product}/affiliate-links
    Route::get('/products/{product}/images', [ProductImageController::class, 'index']);             // GET /api/products/{product}/images

    // Tracking
    Route::post('/events', [\App\Http\Controllers\EventController::class, 'store']);
});

// ─── Admin CRUD (requires Sanctum token) ──────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

    // ── Admin Dashboard ──
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);

    // ── Categories ──
    Route::get('/admin/categories', [CategoryController::class, 'adminIndex']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // ── Products ──
    Route::get('/admin/products', [ProductController::class, 'adminIndex']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // ── Product SKUs ──
    Route::get('/products/{product}/skus', [\App\Http\Controllers\ProductSkuController::class, 'index']);
    Route::post('/products/{product}/skus', [\App\Http\Controllers\ProductSkuController::class, 'store']);
    Route::put('/skus/{sku}', [\App\Http\Controllers\ProductSkuController::class, 'update']);
    Route::delete('/skus/{sku}', [\App\Http\Controllers\ProductSkuController::class, 'destroy']);

    // ── Attributes (all admin-managed) ──
    Route::get('/attributes', [AttributeController::class, 'index']);
    Route::get('/attributes/{id}', [AttributeController::class, 'show']);
    Route::post('/attributes', [AttributeController::class, 'store']);
    Route::put('/attributes/{id}', [AttributeController::class, 'update']);
    Route::delete('/attributes/{id}', [AttributeController::class, 'destroy']);

    // ── Attribute Options (nested under attribute) ──
    Route::get('/attributes/{attribute}/options', [AttributeOptionController::class, 'index']);
    Route::get('/attributes/{attribute}/options/{option}', [AttributeOptionController::class, 'show']);
    Route::post('/attributes/{attribute}/options', [AttributeOptionController::class, 'store']);
    Route::put('/attributes/{attribute}/options/{option}', [AttributeOptionController::class, 'update']);
    Route::delete('/attributes/{attribute}/options/{option}', [AttributeOptionController::class, 'destroy']);

    // ── Product Attribute Values (EAV) ──
    Route::get('/products/{product}/attribute-values', [ProductAttributeValueController::class, 'index']);
    Route::post('/products/{product}/attribute-values', [ProductAttributeValueController::class, 'store']);
    Route::put('/products/{product}/attribute-values/{value}', [ProductAttributeValueController::class, 'update']);
    Route::delete('/products/{product}/attribute-values/{value}', [ProductAttributeValueController::class, 'destroy']);

    // ── Monetization: Ads ──
    Route::get('/admin/ads', [AdController::class, 'adminIndex']);
    Route::post('/admin/ads', [AdController::class, 'store']);
    Route::put('/admin/ads/{ad}', [AdController::class, 'update']);
    Route::delete('/admin/ads/{ad}', [AdController::class, 'destroy']);

    // ── Monetization: Affiliate Links ──
    Route::get('/admin/affiliate-links', [AffiliateLinkController::class, 'adminIndex']);
    Route::post('/products/{product}/affiliate-links', [AffiliateLinkController::class, 'store']);
    Route::put('/affiliate-links/{affiliateLink}', [AffiliateLinkController::class, 'update']);
    Route::delete('/affiliate-links/{affiliateLink}', [AffiliateLinkController::class, 'destroy']);

    // ── Monetization: Product Images ──
    Route::get('/admin/product-images', [ProductImageController::class, 'adminIndex']);
    Route::post('/products/{product}/images', [ProductImageController::class, 'store']);
    Route::put('/products/{product}/images/{image}', [ProductImageController::class, 'update']);
    Route::delete('/products/{product}/images/{image}', [ProductImageController::class, 'destroy']);
});


