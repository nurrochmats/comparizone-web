<?php

namespace Database\Seeders;

use App\Models\Ad;
use Illuminate\Database\Seeder;

class AdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ads = [
            [
                'title'      => 'DomaiNesia Banner 1',
                'placement'  => 'footerads',
                'image_url'  => 'https://dnva.me/v9ev4',
                'target_url' => 'https://my.domainesia.com/ref.php?u=24487',
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'is_active'  => true,
            ],
            [
                'title'      => 'Web Hosting DomaiNesia',
                'placement'  => 'footerads',
                'image_url'  => 'https://dnva.me/32ar4',
                'target_url' => 'https://my.domainesia.com/ref.php?u=24487',
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'is_active'  => true,
            ],
            [
                'title'      => 'www.domainesia.com',
                'placement'  => 'footerads',
                'image_url'  => 'https://dnva.me/4gnsc',
                'target_url' => 'https://my.domainesia.com/ref.php?u=24487',
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'is_active'  => true,
            ],
            [
                'title'      => 'DomaiNesia Banner 2',
                'placement'  => 'footerads',
                'image_url'  => 'https://dnva.me/2o1xf',
                'target_url' => 'https://my.domainesia.com/ref.php?u=24487',
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'is_active'  => true,
            ],
        ];

        foreach ($ads as $adData) {
            Ad::updateOrCreate(
                ['image_url' => $adData['image_url']],
                $adData
            );
        }
    }
}
