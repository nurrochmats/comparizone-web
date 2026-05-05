<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Attribute;

class AttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $smartphone = Category::where('slug', 'smartphone')->firstOrFail();
        $laptop = Category::where('slug', 'laptop')->firstOrFail();
        $vga = Category::where('slug', 'vga')->firstOrFail();

        $attributes = [
            // Smartphone
            ['category_id' => $smartphone->id, 'code' => 'storage', 'name' => 'Storage', 'data_type' => 'number', 'input_type' => 'number', 'unit' => 'GB', 'sort_order' => 1],
            ['category_id' => $smartphone->id, 'code' => 'color', 'name' => 'Color', 'data_type' => 'string', 'input_type' => 'text', 'sort_order' => 2],
            ['category_id' => $smartphone->id, 'code' => 'screen_size', 'name' => 'Screen Size', 'data_type' => 'number', 'input_type' => 'number', 'unit' => 'inch', 'sort_order' => 3],
            ['category_id' => $smartphone->id, 'code' => 'display_type', 'name' => 'Display Type', 'data_type' => 'option', 'input_type' => 'select', 'sort_order' => 4],
            ['category_id' => $smartphone->id, 'code' => 'weight', 'name' => 'Weight', 'data_type' => 'number', 'input_type' => 'number', 'unit' => 'g', 'sort_order' => 5],

            // Laptop
            ['category_id' => $laptop->id, 'code' => 'ram', 'name' => 'RAM', 'data_type' => 'number', 'input_type' => 'number', 'unit' => 'GB', 'sort_order' => 1],
            ['category_id' => $laptop->id, 'code' => 'storage', 'name' => 'Storage', 'data_type' => 'number', 'input_type' => 'number', 'unit' => 'GB', 'sort_order' => 2],
            ['category_id' => $laptop->id, 'code' => 'processor', 'name' => 'Processor', 'data_type' => 'string', 'input_type' => 'text', 'sort_order' => 3],

            // VGA
            ['category_id' => $vga->id, 'code' => 'vram', 'name' => 'VRAM', 'data_type' => 'number', 'input_type' => 'number', 'unit' => 'GB', 'sort_order' => 1],
            ['category_id' => $vga->id, 'code' => 'memory_type', 'name' => 'Memory Type', 'data_type' => 'option', 'input_type' => 'select', 'sort_order' => 2],
            ['category_id' => $vga->id, 'code' => 'brand_spec', 'name' => 'Brand', 'data_type' => 'string', 'input_type' => 'text', 'sort_order' => 3],
            ['category_id' => $vga->id, 'code' => 'chipset', 'name' => 'Chipset', 'data_type' => 'string', 'input_type' => 'text', 'sort_order' => 4],
        ];

        foreach ($attributes as $attribute) {
            Attribute::updateOrCreate(
                ['category_id' => $attribute['category_id'], 'code' => $attribute['code']],
                $attribute
            );
        }
    }
}
