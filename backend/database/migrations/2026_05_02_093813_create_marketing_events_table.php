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
        // Use marketing schema as per the project structure
        Schema::create('marketing.events', function (Blueprint $table) {
            $table->id();
            $table->uuid('visitor_id');
            $table->string('event_type'); // page_view, product_view, click
            $table->string('event_name')->nullable(); // optional detail
            $table->jsonb('metadata')->nullable(); // flexible data
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing.events');
    }
};
