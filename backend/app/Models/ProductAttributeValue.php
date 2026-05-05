<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAttributeValue extends Model
{
    const UPDATED_AT = null;

    protected $table = 'core.product_attribute_values';

    protected $fillable = [
        'product_id',
        'sku_id',
        'attribute_id',
        'value_text',
        'value_number',
        'value_boolean',
        'value_option_id',
        'value_json',
    ];

    protected $casts = [
        'value_boolean' => 'boolean',
        'value_number' => 'float',
        'value_json' => 'array',
    ];

    /**
     * Get the product that owns the value.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the SKU variant that owns the value.
     */
    public function sku(): BelongsTo
    {
        return $this->belongsTo(ProductSku::class, 'sku_id');
    }

    /**
     * Get the attribute that this value is for.
     */
    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    /**
     * Get the option value if applicable.
     */
    public function option(): BelongsTo
    {
        return $this->belongsTo(AttributeOption::class, 'value_option_id');
    }
}
