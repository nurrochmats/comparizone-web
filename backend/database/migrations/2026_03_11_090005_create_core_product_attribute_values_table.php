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
        Schema::create('core.product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('attribute_id');

            $table->text('value_text')->nullable();
            $table->decimal('value_number', 65, 30)->nullable();
            $table->boolean('value_boolean')->nullable();
            $table->unsignedBigInteger('value_option_id')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Foreign keys
            $table->foreign('product_id')
                ->references('id')
                ->on('core.products')
                ->onDelete('cascade');

            $table->foreign('attribute_id')
                ->references('id')
                ->on('core.attributes')
                ->onDelete('cascade');

            $table->foreign('value_option_id')
                ->references('id')
                ->on('core.attribute_options')
                ->onDelete('cascade');

            // Unique constraint
            $table->unique(['product_id', 'attribute_id']);

            // Performance indexes
            $table->index('product_id', 'idx_pav_product');
            $table->index('attribute_id', 'idx_pav_attribute');
            $table->index('value_option_id', 'idx_pav_option');
            $table->index('value_number', 'idx_pav_number');
            $table->index('value_boolean', 'idx_pav_boolean');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core.product_attribute_values');
    }
};
