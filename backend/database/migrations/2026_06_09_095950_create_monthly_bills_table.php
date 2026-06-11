<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_bills', function (Blueprint $table) {
            $table->id();

            $table->foreignId('resident_id')
                ->constrained('residents')
                ->cascadeOnDelete();

            $table->foreignId('house_id')
                ->constrained('houses')
                ->cascadeOnDelete();

            $table->foreignId('payment_type_id')
                ->constrained('payment_types')
                ->cascadeOnDelete();

            $table->date('bill_month');

            $table->decimal('amount', 15, 2);

            $table->enum('status', [
                'pending',
                'partially_paid',
                'paid',
            ])->default('pending');

            $table->text('notes')
                ->nullable();

            $table->timestamps();

            $table->unique([
                'resident_id',
                'house_id',
                'payment_type_id',
                'bill_month'
            ], 'monthly_bill_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_bills');
    }
};
