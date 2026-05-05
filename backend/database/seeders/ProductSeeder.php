<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSku;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $smartphone = Category::where('slug', 'smartphone')->firstOrFail();
        $laptop = Category::where('slug', 'laptop')->firstOrFail();
        $vga = Category::where('slug', 'vga')->firstOrFail();

        $data = [
            'smartphone' => [
                $smartphone->id => [
                    ['brand' => 'Samsung', 'name' => 'Samsung Galaxy S24 Ultra', 'price_min' => 18000000, 'price_max' => 22000000],
                    ['brand' => 'Apple', 'name' => 'iPhone 15 Pro Max', 'price_min' => 20000000, 'price_max' => 25000000],
                    ['brand' => 'Google', 'name' => 'Google Pixel 8 Pro', 'price_min' => 15000000, 'price_max' => 17000000],
                    ['brand' => 'Xiaomi', 'name' => 'Xiaomi 14 Ultra', 'price_min' => 13000000, 'price_max' => 15000000],
                    ['brand' => 'Oppo', 'name' => 'Oppo Find X7 Ultra', 'price_min' => 14000000, 'price_max' => 16000000],
                ]
            ],
            'laptop' => [
                $laptop->id => [
                    ['brand' => 'Apple', 'name' => 'MacBook Pro M3 Max 16', 'price_min' => 50000000, 'price_max' => 65000000],
                    ['brand' => 'ASUS', 'name' => 'ASUS ROG Zephyrus G14 2024', 'price_min' => 28000000, 'price_max' => 35000000],
                    ['brand' => 'Dell', 'name' => 'Dell XPS 15 9530', 'price_min' => 30000000, 'price_max' => 40000000],
                    ['brand' => 'Lenovo', 'name' => 'Lenovo Legion 7i Gen 9', 'price_min' => 25000000, 'price_max' => 32000000],
                    ['brand' => 'Razer', 'name' => 'Razer Blade 16 2024', 'price_min' => 55000000, 'price_max' => 70000000],
                ]
            ],
            'vga' => [
                $vga->id => [
                    ['brand' => 'NVIDIA', 'name' => 'NVIDIA GeForce RTX 4090 Founders Edition', 'price_min' => 30000000, 'price_max' => 35000000],
                    ['brand' => 'ASUS', 'name' => 'ASUS ROG Strix RTX 4080 Super', 'price_min' => 20000000, 'price_max' => 24000000],
                    ['brand' => 'MSI', 'name' => 'MSI Gaming X Slim RTX 4070 Ti Super', 'price_min' => 15000000, 'price_max' => 17000000],
                    ['brand' => 'AMD', 'name' => 'AMD Radeon RX 7900 XTX', 'price_min' => 16000000, 'price_max' => 19000000],
                    ['brand' => 'Sapphire', 'name' => 'Sapphire Nitro+ RX 7800 XT', 'price_min' => 9000000, 'price_max' => 11000000],
                ]
            ]
        ];

        foreach ($data as $slug => $categoryData) {
            foreach ($categoryData as $catId => $products) {
                foreach ($products as $p) {
                    $product = Product::updateOrCreate(
                        ['slug' => Str::slug($p['name'])],
                        array_merge($p, ['category_id' => $catId])
                    );

                    // Generate generic SKUs
                    ProductSku::updateOrCreate(
                        ['sku_code' => strtoupper(Str::slug($p['name'])) . '-BASE'],
                        [
                            'product_id' => $product->id,
                            'name' => 'Standard Edition',
                            'base_price' => $p['price_min'],
                            'is_active' => true
                        ]
                    );

                    ProductSku::updateOrCreate(
                        ['sku_code' => strtoupper(Str::slug($p['name'])) . '-UPGRADED'],
                        [
                            'product_id' => $product->id,
                            'name' => 'Upgraded Edition',
                            'base_price' => $p['price_max'],
                            'is_active' => true
                        ]
                    );
                }
            }
        }
    }
}
