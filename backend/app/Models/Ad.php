<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Ad extends Model
{
    protected $table = 'marketing.ads';

    protected $fillable = [
        'title',
        'placement',
        'image_url',
        'target_url',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public static array $placements = [
        'homepage_top',
        'homepage_sidebar',
        'product_page',
        'compare_page',
        'footerads',
    ];

    /**
     * Scope: only ads that are currently active and in their date window.
     */
    public function scopeActive($query, ?string $placement = null)
    {
        $today = Carbon::today();
        $query->where('is_active', true)
              ->where(fn($q) => $q->whereNull('start_date')->orWhere('start_date', '<=', $today))
              ->where(fn($q) => $q->whereNull('end_date')->orWhere('end_date', '>=', $today));

        if ($placement) {
            $query->where('placement', $placement);
        }
    }
}
