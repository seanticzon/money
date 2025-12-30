<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // "BDO Savings", "GCash", "Cash on Hand"
            $table->enum('type', ['bank', 'ewallet', 'cash', 'credit_card']);
            $table->decimal('balance', 15, 2)->default(0);
            $table->string('icon')->nullable(); // For custom icons
            $table->string('color')->nullable(); // "bg-blue-500"
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};