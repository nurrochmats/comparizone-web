<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttributeOption extends Model
{
    public $timestamps = false;

    protected $table = 'core.attribute_options';

    protected $fillable = [
        'attribute_id',
        'value',
        'label',
        'sort_order',
    ];

    /**
     * Get the attribute that owns the option.
     */
    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }
}
