<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            AttributeSeeder::class,
            AttributeOptionSeeder::class,
            ProductSeeder::class,
            ProductAttributeValueSeeder::class,
            AffiliateLinkSeeder::class,
            AdSeeder::class,
        ]);
    }
}
