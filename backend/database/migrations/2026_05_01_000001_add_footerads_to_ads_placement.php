<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, updating an enum usually requires a raw statement if it's a native type.
        // However, Laravel's ->enum() on Postgres often creates a varchar with a check constraint.
        // To be safe and compatible with both, we'll try to update the column.
        
        Schema::table('marketing.ads', function (Blueprint $table) {
            $table->string('placement')->change();
        });

        // If we want to keep the "enum-like" behavior, we could add a check constraint back,
        // but for now, just making it a string is safer for the migration to succeed across environments.
        // We'll rely on Model validation ($placements) and AdController validation.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketing.ads', function (Blueprint $table) {
            $table->enum('placement', [
                'homepage_top',
                'homepage_sidebar',
                'product_page',
                'compare_page',
            ])->change();
        });
    }
};
