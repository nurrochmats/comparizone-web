<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompareResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    private function extractAttributeValue($pav)
    {
        $dataType = $pav->attribute->data_type;
        $value = null;
        $modifier = null;

        if ($dataType === 'boolean') {
            $value = $pav->value_boolean;
            // value_text can serve as a modifier for boolean (e.g. "Wi-Fi 6E" for has_wifi = true)
            $modifier = $pav->value_text;
        } elseif ($dataType === 'number') {
            $value = $pav->value_number;
            // value_text serves as a modifier/qualifier (e.g. "DDR5" for ram = 8, "SSD" for storage = 256)
            $modifier = $pav->value_text;
        } elseif ($dataType === 'option') {
            $value = $pav->option ? $pav->option->label : null;
        } else {
            $value = $pav->value_text;
        }

        return [
            'code' => $pav->attribute->code,
            'name' => $pav->attribute->name,
            'value' => $value,
            'unit' => $pav->attribute->unit,
            'modifier' => $modifier,
        ];
    }

    public function toArray(Request $request): array
    {
        // 1. Base Attributes (where sku_id is null)
        $generalAttributes = collect();
        if ($this->relationLoaded('productAttributeValues')) {
            $generalAttributes = $this->productAttributeValues->whereNull('sku_id')->map(function ($pav) {
                return $this->extractAttributeValue($pav);
            })->keyBy('code');
        }

        // 2. Base Affiliate Links (where sku_id is null)
        $generalLinks = collect();
        if ($this->relationLoaded('affiliateLinks')) {
            $generalLinks = $this->affiliateLinks->whereNull('sku_id')->values();
        }

        // 3. Extrapolate SKUs alongside their explicit overrides
        $skus = $this->whenLoaded('skus', function () {
            return $this->skus->map(function ($sku) {
                $skuAttributes = collect();
                if ($this->relationLoaded('productAttributeValues')) {
                    $skuAttributes = $this->productAttributeValues->where('sku_id', $sku->id)->map(function ($pav) {
                        return $this->extractAttributeValue($pav);
                    })->keyBy('code');
                }

                $skuLinks = collect();
                if ($this->relationLoaded('affiliateLinks')) {
                    $skuLinks = $this->affiliateLinks->where('sku_id', $sku->id)->values();
                }

                return [
                    'id' => $sku->id,
                    'sku_code' => $sku->sku_code,
                    'name' => $sku->name,
                    'base_price' => $sku->base_price,
                    'attributes' => $skuAttributes,
                    'affiliate_links' => $skuLinks,
                ];
            });
        });

        return [
            'id' => $this->id,
            'name' => $this->name,
            'brand' => $this->brand,
            'slug' => $this->slug,
            'price_min' => $this->price_min,
            'price_max' => $this->price_max,
            'thumbnail' => $this->thumbnail,
            'is_active' => $this->is_active,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'attributes' => $generalAttributes,
            'skus' => $skus,
            'affiliate_links' => $generalLinks,
            'images' => $this->whenLoaded('images'),
        ];
    }
}
