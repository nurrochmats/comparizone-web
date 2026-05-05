<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Core Devices
            ['name' => 'Smartphone', 'description' => 'Mobile phones and smartphones'],
            ['name' => 'Laptop', 'description' => 'Notebooks and laptops'],
            ['name' => 'Tablet', 'description' => 'Tablet devices'],

            // Computer Components
            ['name' => 'Processor', 'description' => 'CPU / processors'],
            ['name' => 'Motherboard', 'description' => 'Mainboards'],
            ['name' => 'RAM', 'description' => 'Memory modules'],
            ['name' => 'Storage', 'description' => 'SSD, HDD, NVMe'],
            ['name' => 'VGA', 'description' => 'Graphics cards (GPU)'],
            ['name' => 'Power Supply', 'description' => 'PSU units'],
            ['name' => 'Casing', 'description' => 'Computer cases'],

            // Accessories
            ['name' => 'Keyboard', 'description' => 'Mechanical and membrane keyboards'],
            ['name' => 'Mouse', 'description' => 'Computer mouse'],
            ['name' => 'Monitor', 'description' => 'Display screens'],
            ['name' => 'Headset', 'description' => 'Headphones and headsets'],
            ['name' => 'Webcam', 'description' => 'Cameras for video calls'],
            ['name' => 'Speaker', 'description' => 'Audio speakers'],

            // Networking
            ['name' => 'Router', 'description' => 'Networking routers'],
            ['name' => 'Modem', 'description' => 'Internet modems'],
            ['name' => 'Access Point', 'description' => 'Wireless access points'],

            // Gaming
            ['name' => 'Gaming Console', 'description' => 'PlayStation, Xbox, etc'],
            ['name' => 'Gaming Accessories', 'description' => 'Controllers, gaming gear'],

            // Office & Productivity
            ['name' => 'Printer', 'description' => 'Printers and scanners'],
            ['name' => 'Scanner', 'description' => 'Document scanners'],

            // Smart Devices
            ['name' => 'Smartwatch', 'description' => 'Wearable smart devices'],
            ['name' => 'Smart Home', 'description' => 'IoT and smart home devices'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'slug' => Str::slug($category['name']),
                    'description' => $category['description'],
                ]
            );
        }
    }
}
