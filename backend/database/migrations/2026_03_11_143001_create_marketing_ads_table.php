<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing.ads', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('placement', [
                'homepage_top',
                'homepage_sidebar',
                'product_page',
                'compare_page',
            ])->index('idx_ads_placement');
            $table->string('image_url');
            $table->string('target_url');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active', 'idx_ads_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing.ads');
    }
};
