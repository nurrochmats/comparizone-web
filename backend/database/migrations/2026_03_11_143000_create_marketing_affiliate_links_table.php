<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing.affiliate_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('core.products')->cascadeOnDelete();
            $table->string('store_name', 100);           // e.g. Shopee, Tokopedia, Amazon
            $table->string('affiliate_url');
            $table->string('commission_note')->nullable(); // e.g. "Up to 5% commission"
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('product_id', 'idx_affiliate_product');
            $table->index('is_active', 'idx_affiliate_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing.affiliate_links');
    }
};
