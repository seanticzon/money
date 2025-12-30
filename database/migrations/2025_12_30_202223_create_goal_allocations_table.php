<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goal_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('goal_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->nullable()->constrained()->onDelete('set null');
            
            $table->decimal('amount', 15, 2);
            $table->text('notes')->nullable();
            $table->date('allocation_date');
            $table->timestamps();

            $table->index(['user_id', 'allocation_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_allocations');
    }
};