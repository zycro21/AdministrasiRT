<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('monthly_bill_id')
                ->constrained('monthly_bills')
                ->cascadeOnDelete();

            $table->foreignId('resident_id')
                ->constrained('residents')
                ->cascadeOnDelete();

            $table->foreignId('house_id')
                ->constrained('houses')
                ->cascadeOnDelete();

            $table->foreignId('payment_type_id')
                ->constrained('payment_types')
                ->cascadeOnDelete();

            $table->decimal('amount', 15, 2);

            $table->date('payment_month');

            $table->dateTime('paid_at')
                ->nullable();

            $table->text('notes')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
