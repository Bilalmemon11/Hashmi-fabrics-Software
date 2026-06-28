<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    protected $fillable = ['name', 'phone', 'city', 'balance', 'total_purchase'];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'total_purchase' => 'decimal:2',
        ];
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(VendorPayment::class);
    }
}
