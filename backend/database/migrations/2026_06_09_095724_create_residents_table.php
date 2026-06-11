<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('residents', function (Blueprint $table) {
            $table->id();

            $table->string('full_name');

            $table->string('ktp_photo');

            $table->enum('resident_status', [
                'contract',
                'permanent'
            ]);

            $table->string('phone_number');

            $table->boolean('marital_status')
                ->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};