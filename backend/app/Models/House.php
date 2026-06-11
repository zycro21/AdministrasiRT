<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class House extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_number',
        'address',
        'occupancy_status',
    ];

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function activeResidents()
    {
        return $this->hasMany(HouseResident::class)
            ->where('is_active', true);
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
