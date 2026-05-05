<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing.product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('core.products')->cascadeOnDelete();
            $table->string('image_url');
            $table->boolean('is_primary')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->index('product_id', 'idx_pimages_product');
            $table->index(['product_id', 'is_primary'], 'idx_pimages_primary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing.product_images');
    }
};
