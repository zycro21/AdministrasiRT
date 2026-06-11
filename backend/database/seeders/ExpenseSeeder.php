<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Expense;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $expenses = [

            [
                'title' => 'Gaji Satpam Januari',
                'amount' => 3000000,
                'expense_date' => '2026-01-05',
            ],

            [
                'title' => 'Token Listrik Pos Satpam',
                'amount' => 250000,
                'expense_date' => '2026-01-10',
            ],

            [
                'title' => 'Perbaikan Jalan',
                'amount' => 5000000,
                'expense_date' => '2026-03-15',
            ],

            [
                'title' => 'Perbaikan Selokan',
                'amount' => 2500000,
                'expense_date' => '2026-05-20',
            ],
        ];

        Expense::insert(
            collect($expenses)
                ->map(fn($item) => [
                    ...$item,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
                ->toArray()
        );
    }
}
