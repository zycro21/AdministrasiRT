<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Resident extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'ktp_photo',
        'resident_status',
        'phone_number',
        'marital_status',
    ];

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function monthlyBills()
    {
        return $this->hasMany(MonthlyBill::class);
    }
}
