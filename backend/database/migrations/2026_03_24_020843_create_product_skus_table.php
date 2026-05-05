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
        Schema::create('core.product_skus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('core.products')->cascadeOnDelete();
            $table->string('sku_code')->unique();
            $table->string('name');
            $table->decimal('base_price', 15, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core.product_skus');
    }
};
