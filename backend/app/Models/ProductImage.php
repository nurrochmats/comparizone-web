<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $table = 'marketing.product_images';

    public $timestamps  = false;
    public $updatedAt   = false;

    protected $fillable = [
        'product_id',
        'image_url',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary'  => 'boolean',
        'sort_order'  => 'integer',
        'created_at'  => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
