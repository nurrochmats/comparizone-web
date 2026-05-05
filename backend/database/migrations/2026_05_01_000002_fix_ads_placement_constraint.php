<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the existing constraint if it exists. 
        // Based on the error message, it's named 'ads_placement_check'.
        
        DB::statement('ALTER TABLE marketing.ads DROP CONSTRAINT IF EXISTS ads_placement_check');

        // Re-add the constraint with 'footerads' included.
        DB::statement("ALTER TABLE marketing.ads ADD CONSTRAINT ads_placement_check CHECK (placement IN ('homepage_top', 'homepage_sidebar', 'product_page', 'compare_page', 'footerads'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE marketing.ads DROP CONSTRAINT IF EXISTS ads_placement_check');
        
        // Re-add the original constraint.
        DB::statement("ALTER TABLE marketing.ads ADD CONSTRAINT ads_placement_check CHECK (placement IN ('homepage_top', 'homepage_sidebar', 'product_page', 'compare_page'))");
    }
};
