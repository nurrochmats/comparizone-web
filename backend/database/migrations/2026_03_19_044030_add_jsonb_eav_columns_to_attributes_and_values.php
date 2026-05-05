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
        if (!Schema::hasColumn('core.attributes', 'schema')) {
            Schema::table('core.attributes', function (Blueprint $table) {
                $table->jsonb('schema')->nullable();
            });
        }

        if (!Schema::hasColumn('core.product_attribute_values', 'value_json')) {
            Schema::table('core.product_attribute_values', function (Blueprint $table) {
                $table->jsonb('value_json')->nullable();
            });
        }

        // Add GIN index if not exists (check by name in pg_indexes)
        $indexExists = DB::select("SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pav_value_json_gin'");
        if (empty($indexExists)) {
            DB::statement('CREATE INDEX idx_pav_value_json_gin ON core.product_attribute_values USING gin (value_json)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS core.idx_pav_value_json_gin');

        Schema::table('core.product_attribute_values', function (Blueprint $table) {
            $table->dropColumn('value_json');
        });

        Schema::table('core.attributes', function (Blueprint $table) {
            $table->dropColumn('schema');
        });
    }
};
