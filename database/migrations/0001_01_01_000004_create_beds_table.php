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
        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained()->cascadeOnDelete();
            $table->string('code'); // e.g., BED-001
            $table->boolean('is_ventilator')->default(false);
            $table->boolean('is_isolation')->default(false);
            $table->enum('status', ['kosong', 'terisi', 'rencana_pulang', 'discharge_planning'])->default('kosong');
            $table->text('deskripsi')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beds');
    }
};
