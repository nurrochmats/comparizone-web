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
        Schema::create('core.products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('brand', 100)->nullable();
            $table->string('name', 150);
            $table->string('slug', 150)->unique();
            $table->date('release_date')->nullable();
            $table->bigInteger('price_min')->nullable();
            $table->bigInteger('price_max')->nullable();
            $table->text('thumbnail')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('category_id')
                ->references('id')
                ->on('core.categories')
                ->onDelete('cascade');

            $table->index('category_id', 'idx_products_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core.products');
    }
};
