<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeOption;
use Illuminate\Http\Request;

class AttributeOptionController extends Controller
{
    /** GET /api/attributes/{attribute}/options */
    public function index(int $attribute)
    {
        $attr = Attribute::findOrFail($attribute);
        return response()->json($attr->options()->orderBy('sort_order')->get());
    }

    /** GET /api/attributes/{attribute}/options/{option} */
    public function show(int $attribute, int $option)
    {
        $opt = AttributeOption::where('attribute_id', $attribute)->findOrFail($option);
        return response()->json($opt);
    }

    /** POST /api/attributes/{attribute}/options — admin only */
    public function store(Request $request, int $attribute)
    {
        // Verify parent attribute exists
        Attribute::findOrFail($attribute);

        $data = $request->validate([
            'value'      => ['required', 'string', 'max:100'],
            'label'      => ['nullable', 'string', 'max:100'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $data['attribute_id'] = $attribute;

        $option = AttributeOption::create($data);

        return response()->json($option, 201);
    }

    /** PUT /api/attributes/{attribute}/options/{option} — admin only */
    public function update(Request $request, int $attribute, int $option)
    {
        $opt = AttributeOption::where('attribute_id', $attribute)->findOrFail($option);

        $data = $request->validate([
            'value'      => ['sometimes', 'required', 'string', 'max:100'],
            'label'      => ['nullable', 'string', 'max:100'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $opt->update($data);

        return response()->json($opt->fresh());
    }

    /** DELETE /api/attributes/{attribute}/options/{option} — admin only */
    public function destroy(int $attribute, int $option)
    {
        $opt = AttributeOption::where('attribute_id', $attribute)->findOrFail($option);
        $opt->delete();

        return response()->json(['message' => 'Option deleted.']);
    }
}
