<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attribute extends Model
{
    protected $table = 'core.attributes';

    protected $fillable = [
        'category_id',
        'code',
        'name',
        'data_type',
        'input_type',
        'is_filterable',
        'is_required',
        'is_multi_value',
        'filter_strategy',
        'unit',
        'sort_order',
        'schema',
    ];

    protected $casts = [
        'schema' => 'array',
    ];

    /**
     * Get the category that owns the attribute.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the options for the attribute.
     */
    public function options(): HasMany
    {
        return $this->hasMany(AttributeOption::class);
    }

    /**
     * Get the product attribute values for the attribute.
     */
    public function productAttributeValues(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class);
    }
}
