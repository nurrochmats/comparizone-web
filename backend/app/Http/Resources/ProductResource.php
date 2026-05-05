<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'brand' => $this->brand,
            'slug' => $this->slug,
            'price_min' => $this->price_min,
            'price_max' => $this->price_max,
            'thumbnail' => $this->thumbnail,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'skus' => $this->whenLoaded('skus', function () {
                return $this->skus->map(function ($sku) {
                    return [
                        'id' => $sku->id,
                        'name' => $sku->name,
                    ];
                });
            }),
            'affiliate_links_count' => $this->whenCounted('affiliateLinks'),
            'images_count' => $this->whenCounted('images'),
        ];
    }
}
