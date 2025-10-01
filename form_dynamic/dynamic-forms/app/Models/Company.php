<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'max_users',
        'is_active',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function formTemplates()
    {
        return $this->hasMany(FormTemplate::class);
    }

    /**
     * Get the abonnements for the company.
     */
    public function abonnements()
    {
        return $this->hasMany(Abonnement::class);
    }
}
