<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('core.product_attribute_values', function (Blueprint $table) {
            $table->foreignId('sku_id')->nullable()->after('product_id')->constrained('core.product_skus')->cascadeOnDelete();
            
            // Overwrite old constraint to allow multi-SKU variants
            $table->dropUnique('core_product_attribute_values_product_id_attribute_id_unique');
            $table->unique(['product_id', 'attribute_id', 'sku_id'], 'core_pav_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('core.product_attribute_values', function (Blueprint $table) {
            $table->dropUnique('core_pav_unique');
            $table->unique(['product_id', 'attribute_id'], 'core_product_attribute_values_product_id_attribute_id_unique');

            $table->dropForeign(['sku_id']);
            $table->dropColumn('sku_id');
        });
    }
};
