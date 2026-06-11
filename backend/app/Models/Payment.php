<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'monthly_bill_id',
        'resident_id',
        'house_id',
        'payment_type_id',
        'amount',
        'payment_month',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_month' => 'date',
        'paid_at' => 'datetime',
    ];

    public function monthlyBill()
    {
        return $this->belongsTo(MonthlyBill::class);
    }

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
}
