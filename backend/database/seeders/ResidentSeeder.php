<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Resident;

class ResidentSeeder extends Seeder
{
    public function run(): void
    {
        // penghuni tetap
        for ($i = 1; $i <= 15; $i++) {

            Resident::create([
                'full_name' => "Warga Tetap {$i}",
                'ktp_photo' => "ktp{$i}.jpg",
                'resident_status' => 'permanent',
                'phone_number' => '081234567' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'marital_status' => $i % 2 === 0,
            ]);
        }

        // penghuni kontrak
        for ($i = 16; $i <= 18; $i++) {

            Resident::create([
                'full_name' => "Warga Kontrak {$i}",
                'ktp_photo' => "ktp{$i}.jpg",
                'resident_status' => 'contract',
                'phone_number' => '082345678' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'marital_status' => false,
            ]);
        }

        // eks penghuni (histori)
        for ($i = 19; $i <= 22; $i++) {

            Resident::create([
                'full_name' => "Eks Penghuni {$i}",
                'ktp_photo' => "ktp{$i}.jpg",
                'resident_status' => 'contract',
                'phone_number' => '083456789' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'marital_status' => false,
            ]);
        }
    }
}
