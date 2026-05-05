<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeOption;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    /** GET /api/attributes?category_id=1 */
    public function index(Request $request)
    {
        $perPage = min($request->integer('per_page', 10), 100);
        $search = $request->input('search');

        $query = Attribute::with(['category', 'options'])
            ->withCount(['options', 'productAttributeValues as products_count']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(code) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }

        $attributes = $query->orderBy('sort_order')->paginate($perPage);
        return response()->json($attributes);
    }

    /** GET /api/attributes/{id} */
    public function show(int $id)
    {
        $attribute = Attribute::with(['category', 'options'])->findOrFail($id);
        return response()->json($attribute);
    }

    /** POST /api/attributes — admin only */
    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id'     => ['required', 'integer', 'exists:categories,id'],
            'code'            => ['required', 'string', 'max:50'],
            'name'            => ['required', 'string', 'max:100'],
            'data_type'       => ['required', 'in:text,number,boolean,option'],
            'input_type'      => ['nullable', 'in:text,number,select,checkbox,radio'],
            'is_filterable'   => ['boolean'],
            'is_required'     => ['boolean'],
            'is_multi_value'  => ['boolean'],
            'filter_strategy' => ['nullable', 'in:exact,range,boolean'],
            'unit'            => ['nullable', 'string', 'max:20'],
            'sort_order'      => ['integer', 'min:0'],
        ]);

        $attribute = Attribute::create($data);

        return response()->json($attribute->load('category'), 201);
    }

    /** PUT /api/attributes/{id} — admin only */
    public function update(Request $request, int $id)
    {
        $attribute = Attribute::findOrFail($id);

        $data = $request->validate([
            'category_id'     => ['sometimes', 'integer', 'exists:categories,id'],
            'code'            => ['sometimes', 'required', 'string', 'max:50'],
            'name'            => ['sometimes', 'required', 'string', 'max:100'],
            'data_type'       => ['sometimes', 'in:text,number,boolean,option'],
            'input_type'      => ['nullable', 'in:text,number,select,checkbox,radio'],
            'is_filterable'   => ['boolean'],
            'is_required'     => ['boolean'],
            'is_multi_value'  => ['boolean'],
            'filter_strategy' => ['nullable', 'in:exact,range,boolean'],
            'unit'            => ['nullable', 'string', 'max:20'],
            'sort_order'      => ['integer', 'min:0'],
        ]);

        $attribute->update($data);

        return response()->json($attribute->fresh('category'));
    }

    /** DELETE /api/attributes/{id} — admin only */
    public function destroy(int $id)
    {
        $attribute = Attribute::findOrFail($id);
        $attribute->delete();

        return response()->json(['message' => 'Attribute deleted.']);
    }
}
