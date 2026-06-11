<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MonthlyBill;
use App\Models\PaymentType;
use Carbon\Carbon;

class MonthlyBillSeeder extends Seeder
{
    public function run(): void
    {
        $satpam = PaymentType::where('name', 'Satpam')->first();
        $kebersihan = PaymentType::where('name', 'Kebersihan')->first();

        // Januari - Juni 2026
        $months = [
            '2026-01-01',
            '2026-02-01',
            '2026-03-01',
            '2026-04-01',
            '2026-05-01',
            '2026-06-01',
        ];

        // rumah 1-18 memiliki penghuni aktif
        for ($residentId = 1; $residentId <= 18; $residentId++) {

            foreach ($months as $month) {

                // Tagihan Satpam
                MonthlyBill::create([
                    'resident_id' => $residentId,
                    'house_id' => $residentId,
                    'payment_type_id' => $satpam->id,
                    'bill_month' => $month,
                    'amount' => 100000,
                    'status' => 'pending',
                    'notes' => 'Iuran Satpam',
                ]);

                // Tagihan Kebersihan
                MonthlyBill::create([
                    'resident_id' => $residentId,
                    'house_id' => $residentId,
                    'payment_type_id' => $kebersihan->id,
                    'bill_month' => $month,
                    'amount' => 15000,
                    'status' => 'pending',
                    'notes' => 'Iuran Kebersihan',
                ]);
            }
        }
    }
}
