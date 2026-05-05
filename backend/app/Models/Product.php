<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $table = 'core.products';

    protected $fillable = [
        'category_id',
        'brand',
        'name',
        'slug',
        'release_date',
        'price_min',
        'price_max',
        'thumbnail',
        'is_active',
    ];

    protected $casts = [
        'release_date' => 'date',
    ];

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the attribute values for the product.
     */
    public function productAttributeValues(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class);
    }
    
    /**
     * Get the SKUs/Variants for the product.
     */
    public function skus(): HasMany
    {
        return $this->hasMany(ProductSku::class);
    }

    /**
     * Affiliate buy links for this product.
     */
    public function affiliateLinks(): HasMany
    {
        return $this->hasMany(AffiliateLink::class);
    }

    /**
     * Images for this product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }
}
