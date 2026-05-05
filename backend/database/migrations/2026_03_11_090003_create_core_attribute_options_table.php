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
        Schema::create('core.attribute_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('attribute_id');
            $table->string('value', 100);
            $table->string('label', 100);
            $table->integer('sort_order')->default(0);

            $table->foreign('attribute_id')
                ->references('id')
                ->on('core.attributes')
                ->onDelete('cascade');

            $table->unique(['attribute_id', 'value']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core.attribute_options');
    }
};
