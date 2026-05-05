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
        Schema::create('core.attributes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('code', 100);
            $table->string('name', 100);
            $table->string('data_type', 30);
            $table->string('input_type', 30)->nullable();
            $table->boolean('is_filterable')->default(true);
            $table->boolean('is_required')->default(false);
            $table->boolean('is_multi_value')->default(false);
            $table->string('filter_strategy', 30)->nullable();
            $table->string('unit', 30)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('category_id')
                ->references('id')
                ->on('core.categories')
                ->onDelete('cascade');

            $table->unique(['category_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core.attributes');
    }
};
