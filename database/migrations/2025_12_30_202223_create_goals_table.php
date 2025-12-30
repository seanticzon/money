<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Optional: link goal to specific account
            $table->foreignId('account_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('name'); // "Emergency Fund", "New Laptop"
            $table->string('icon')->nullable(); // "🏦", "💻"
            $table->string('color')->nullable(); // "bg-blue-500"
            $table->decimal('target_amount', 15, 2);
            $table->decimal('current_amount', 15, 2)->default(0);
            $table->date('deadline')->nullable();
            $table->decimal('monthly_target', 15, 2)->nullable(); // Suggested monthly contribution
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};