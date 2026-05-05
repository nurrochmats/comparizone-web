<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductSku extends Model
{
    use HasFactory;

    protected $table = 'core.product_skus';

    protected $fillable = [
        'product_id',
        'sku_code',
        'name',
        'base_price',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function affiliateLinks(): HasMany
    {
        return $this->hasMany(AffiliateLink::class, 'sku_id');
    }

    public function attributeValues(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class, 'sku_id');
    }
}
