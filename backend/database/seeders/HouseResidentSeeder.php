<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HouseResident;

class HouseResidentSeeder extends Seeder
{
    public function run(): void
    {
        // penghuni aktif saat ini
        for ($i = 1; $i <= 18; $i++) {

            HouseResident::create([
                'house_id' => $i,
                'resident_id' => $i,
                'start_date' => now()->subMonths(rand(3, 24)),
                'is_active' => true,
            ]);
        }

        // histori rumah 16
        HouseResident::create([
            'house_id' => 16,
            'resident_id' => 19,
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'is_active' => false,
        ]);

        // histori rumah 17
        HouseResident::create([
            'house_id' => 17,
            'resident_id' => 20,
            'start_date' => '2024-06-01',
            'end_date' => '2025-05-31',
            'is_active' => false,
        ]);

        // histori rumah 18
        HouseResident::create([
            'house_id' => 18,
            'resident_id' => 21,
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'is_active' => false,
        ]);
    }
}
