<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateLink extends Model
{
    protected $table = 'marketing.affiliate_links';

    protected $fillable = [
        'product_id',
        'sku_id',
        'product_name',
        'store_name',
        'affiliate_url',
        'price',
        'image_url',
        'commission_note',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function sku(): BelongsTo
    {
        return $this->belongsTo(ProductSku::class, 'sku_id');
    }
}
