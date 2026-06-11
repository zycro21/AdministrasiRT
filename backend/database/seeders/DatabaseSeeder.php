<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            PaymentTypeSeeder::class,

            HouseSeeder::class,
            ResidentSeeder::class,
            HouseResidentSeeder::class,
            MonthlyBillSeeder::class,
            ExpenseSeeder::class,
        ]);
    }
}
