<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\ProductAttributeValue;

class ProductAttributeValueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::with('category', 'skus')->get();

        foreach ($products as $product) {
            $this->seedSpecs($product);
        }
    }

    private function seedSpecs($product)
    {
        $categorySlug = $product->category->slug;

        switch ($categorySlug) {
            case 'smartphone':
                $this->smartphoneSpecs($product);
                break;
            case 'laptop':
                $this->laptopSpecs($product);
                break;
            case 'vga':
                $this->vgaSpecs($product);
                break;
        }
    }

    private function smartphoneSpecs($product)
    {
        $storageAttr = Attribute::where('code', 'storage')->first();
        $colorAttr = Attribute::where('code', 'color')->first();
        $screenAttr = Attribute::where('code', 'screen_size')->first();
        $displayAttr = Attribute::where('code', 'display_type')->first();
        $weightAttr = Attribute::where('code', 'weight')->first();

        // General Specs
        ProductAttributeValue::updateOrCreate(
            ['product_id' => $product->id, 'attribute_id' => $screenAttr->id, 'sku_id' => null],
            ['value_number' => 6.7]
        );

        $amoled = AttributeOption::where('value', 'amoled')->first();
        ProductAttributeValue::updateOrCreate(
            ['product_id' => $product->id, 'attribute_id' => $displayAttr->id, 'sku_id' => null],
            ['value_option_id' => $amoled->id]
        );

        ProductAttributeValue::updateOrCreate(
            ['product_id' => $product->id, 'attribute_id' => $weightAttr->id, 'sku_id' => null],
            ['value_number' => 220]
        );

        // SKU Specific
        foreach ($product->skus as $index => $sku) {
            ProductAttributeValue::updateOrCreate(
                ['product_id' => $product->id, 'attribute_id' => $storageAttr->id, 'sku_id' => $sku->id],
                ['value_number' => $index === 0 ? 256 : 512]
            );

            ProductAttributeValue::updateOrCreate(
                ['product_id' => $product->id, 'attribute_id' => $colorAttr->id, 'sku_id' => $sku->id],
                ['value_text' => $index === 0 ? 'Titanium Black' : 'Titanium Gray']
            );
        }
    }

    private function laptopSpecs($product)
    {
        $ramAttr = Attribute::where('code', 'ram')->first();
        $storageAttr = Attribute::where('code', 'storage')->first();
        $procAttr = Attribute::where('code', 'processor')->first();

        ProductAttributeValue::updateOrCreate(
            ['product_id' => $product->id, 'attribute_id' => $procAttr->id, 'sku_id' => null],
            ['value_text' => 'High-end Performance Processor']
        );

        foreach ($product->skus as $index => $sku) {
            ProductAttributeValue::updateOrCreate(
                ['product_id' => $product->id, 'attribute_id' => $ramAttr->id, 'sku_id' => $sku->id],
                ['value_number' => $index === 0 ? 16 : 32]
            );

            ProductAttributeValue::updateOrCreate(
                ['product_id' => $product->id, 'attribute_id' => $storageAttr->id, 'sku_id' => $sku->id],
                ['value_number' => $index === 0 ? 512 : 1024]
            );
        }
    }

    private function vgaSpecs($product)
    {
        $vramAttr = Attribute::where('code', 'vram')->first();
        $memTypeAttr = Attribute::where('code', 'memory_type')->first();
        $brandAttr = Attribute::where('code', 'brand_spec')->first();
        $chipsetAttr = Attribute::where('code', 'chipset')->first();

        $gddr6x = AttributeOption::where('value', 'gddr6x')->first();
        
        ProductAttributeValue::updateOrCreate(
            ['product_id' => $product->id, 'attribute_id' => $chipsetAttr->id, 'sku_id' => null],
            ['value_text' => 'Flagship GPU Architecture']
        );

        ProductAttributeValue::updateOrCreate(
            ['product_id' => $product->id, 'attribute_id' => $brandAttr->id, 'sku_id' => null],
            ['value_text' => $product->brand]
        );

        foreach ($product->skus as $sku) {
            ProductAttributeValue::updateOrCreate(
                ['product_id' => $product->id, 'attribute_id' => $vramAttr->id, 'sku_id' => $sku->id],
                ['value_number' => 16]
            );

            ProductAttributeValue::updateOrCreate(
                ['product_id' => $product->id, 'attribute_id' => $memTypeAttr->id, 'sku_id' => $sku->id],
                ['value_option_id' => $gddr6x ? $gddr6x->id : null]
            );
        }
    }
}
