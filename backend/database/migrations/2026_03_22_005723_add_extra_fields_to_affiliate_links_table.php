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
        Schema::table('marketing.affiliate_links', function (Blueprint $table) {
            if (!Schema::hasColumn('marketing.affiliate_links', 'product_name')) {
                $table->string('product_name')->nullable();
            }
            if (!Schema::hasColumn('marketing.affiliate_links', 'price')) {
                $table->decimal('price', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('marketing.affiliate_links', 'image_url')) {
                $table->string('image_url')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('marketing.affiliate_links', function (Blueprint $table) {
            $table->dropColumn(['product_name', 'price', 'image_url']);
        });
    }
};
