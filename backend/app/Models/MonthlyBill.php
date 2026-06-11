<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MonthlyBill extends Model
{
    use HasFactory;

    protected $fillable = [
        'resident_id',
        'house_id',
        'payment_type_id',
        'bill_month',
        'amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'bill_month' => 'date',
        'amount' => 'decimal:2',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function paymentType()
    {
        return $this->belongsTo(PaymentType::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}