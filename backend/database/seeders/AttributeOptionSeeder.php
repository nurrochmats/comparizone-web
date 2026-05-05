<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribute;
use App\Models\AttributeOption;

class AttributeOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Display Type Options
        $display = Attribute::where('code', 'display_type')->firstOrFail();
        $displayOptions = [
            ['value' => 'ips', 'label' => 'IPS LCD'],
            ['value' => 'oled', 'label' => 'OLED'],
            ['value' => 'amoled', 'label' => 'AMOLED'],
            ['value' => 'tft', 'label' => 'TFT'],
            ['value' => 'tn', 'label' => 'TN Panel'],
        ];

        foreach ($displayOptions as $index => $opt) {
            AttributeOption::updateOrCreate(
                ['attribute_id' => $display->id, 'value' => $opt['value']],
                array_merge($opt, ['attribute_id' => $display->id, 'sort_order' => $index + 1])
            );
        }

        // Memory Type Options (GDDR)
        $memory = Attribute::where('code', 'memory_type')->firstOrFail();
        $memoryOptions = [
            ['value' => 'gddr5', 'label' => 'GDDR5'],
            ['value' => 'gddr5x', 'label' => 'GDDR5X'],
            ['value' => 'gddr6', 'label' => 'GDDR6'],
            ['value' => 'gddr6x', 'label' => 'GDDR6X'],
            ['value' => 'hbm2', 'label' => 'HBM2'],
            ['value' => 'hbm3', 'label' => 'HBM3'],
        ];

        foreach ($memoryOptions as $index => $opt) {
            AttributeOption::updateOrCreate(
                ['attribute_id' => $memory->id, 'value' => $opt['value']],
                array_merge($opt, ['attribute_id' => $memory->id, 'sort_order' => $index + 1])
            );
        }
    }
}
