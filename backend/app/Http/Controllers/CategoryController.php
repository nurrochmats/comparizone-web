<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Resources\CategoryNavResource;
use Illuminate\Validation\Rule; // ini penting buat unique slug

class CategoryController extends Controller
{
    /** GET /api/categories — public listing */
    public function index()
    {
        $categories = Category::withCount(['attributes', 'products'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
        return CategoryResource::collection($categories);
    }

    /** GET /api/admin/categories — admin listing including inactive */
    public function adminIndex(Request $request)
    {
        $perPage = min($request->integer('per_page', 10), 100);
        $search = $request->input('search');

        $query = Category::withCount(['attributes', 'products'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%']);
        }

        $categories = $query->paginate($perPage);

        return CategoryResource::collection($categories);
    }

    /** GET /api/categories/nav — dynamic navigation links */
    public function topNav()
    {
        // Get 2 random categories from the top categories by product count
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->orderByDesc('products_count')
            ->limit(5) // Get top 5
            ->get()
            ->shuffle() // Randomize
            ->take(2); // Take 2

        return CategoryNavResource::collection($categories);
    }

    /** GET /api/categories/{id} */
    public function show(int $id)
    {
        $category = Category::findOrFail($id);
        return new CategoryResource($category);
    }

    /** POST /api/categories — admin only */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $category = Category::create($data);

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    /** PUT /api/categories/{id} — admin only */
    public function update(Request $request, int $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            // 'slug' => ['sometimes', 'string', 'max:100', 'unique:categories,slug' . $id],
            // ,
            'slug' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('categories', 'slug')->ignore($id)
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $category->update($data);

        return new CategoryResource($category->fresh());
    }

    /** DELETE /api/categories/{id} — admin only */
    public function destroy(int $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted.'], 200);
    }
}
