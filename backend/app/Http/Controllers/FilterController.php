<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class FilterController extends Controller
{
    /**
     * Filter products based on category and dynamic attributes.
     */
    public function filter(Request $request)
    {
        $request->validate([
            'category' => 'required|string|exists:categories,slug',
            'search' => 'nullable|string',
            'sort' => 'nullable|string|in:price_asc,price_desc,newest,oldest,name_asc,name_desc',
            'filters' => 'array',
            'filters.*.attribute' => 'required|string',
            'per_page' => 'integer|min:1|max:100',
        ]);

        $categorySlug = $request->input('category');
        $filters = $request->input('filters', []);
        $perPage = $request->input('per_page', 20);

        $category = Category::where('slug', $categorySlug)->firstOrFail();

        // Pre-load all relevant attributes for this category to avoid N+1
        $attributeMap = Attribute::where('category_id', $category->id)
            ->get()
            ->keyBy('code');

        // Pre-load option IDs per attribute for option filters
        $optionFilterMap = [];
        foreach ($filters as $filter) {
            $code = $filter['attribute'] ?? null;
            $attr = $code ? $attributeMap->get($code) : null;
            if ($attr && $attr->data_type === 'option' && isset($filter['values'])) {
                $optionFilterMap[$attr->id] = AttributeOption::where('attribute_id', $attr->id)
                    ->whereIn('label', (array) $filter['values'])
                    ->pluck('id');
            }
        }

        $query = Product::with('category')
            ->where('category_id', $category->id)
            ->where('is_active', true);

        if ($request->has('search') && $request->input('search')) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($request->input('search')) . '%']);
        }

        foreach ($filters as $filter) {
            $attributeCode = $filter['attribute'] ?? null;
            if (!$attributeCode) continue;

            /** @var Attribute|null $attribute */
            $attribute = $attributeMap->get($attributeCode);
            if (!$attribute) continue;

            $query->whereHas('productAttributeValues', function (Builder $q) use ($attribute, $filter, $optionFilterMap) {
                $q->where('attribute_id', $attribute->id);

                if ($attribute->data_type === 'option' && isset($optionFilterMap[$attribute->id])) {
                    $q->whereIn('value_option_id', $optionFilterMap[$attribute->id]);
                } elseif ($attribute->data_type === 'boolean' && isset($filter['value_boolean'])) {
                    $q->where('value_boolean', (bool) $filter['value_boolean']);
                } elseif ($attribute->data_type === 'number') {
                    if (isset($filter['min'])) {
                        $q->where('value_number', '>=', $filter['min']);
                    }
                    if (isset($filter['max'])) {
                        $q->where('value_number', '<=', $filter['max']);
                    }
                }
            });
        }

        $sort = $request->input('sort');
        if ($sort) {
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price_min', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price_min', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'name_desc':
                    $query->orderBy('name', 'desc');
                    break;
            }
        } else {
            // Default sort
            $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }
}
