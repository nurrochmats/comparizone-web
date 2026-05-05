<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\AffiliateLink;

class AffiliateLinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::with('skus')->get();
        
        $platforms = [
            ['name' => 'Shopee', 'url' => 'https://shopee.co.id/search?keyword='],
            ['name' => 'Tokopedia', 'url' => 'https://www.tokopedia.com/search?q='],
            ['name' => 'Amazon', 'url' => 'https://www.amazon.com/s?k='],
        ];

        foreach ($products as $product) {
            foreach ($product->skus as $sku) {
                foreach ($platforms as $platform) {
                    AffiliateLink::updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'sku_id' => $sku->id,
                            'store_name' => $platform['name'],
                        ],
                        [
                            'product_name' => $product->name . ' - ' . $sku->name,
                            'affiliate_url' => $platform['url'] . urlencode($product->name . ' ' . $sku->name),
                            'price' => $sku->base_price ? $sku->base_price : 0,
                            'image_url' => 'https://via.placeholder.com/300x300.png?text=' . urlencode($product->name),
                            'commission_note' => 'Up to 5% commission',
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
