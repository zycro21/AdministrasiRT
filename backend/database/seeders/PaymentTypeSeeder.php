<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentType;

class PaymentTypeSeeder extends Seeder
{
    public function run(): void
    {
        PaymentType::insert([
            [
                'name' => 'Satpam',
                'default_amount' => 100000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kebersihan',
                'default_amount' => 15000,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}