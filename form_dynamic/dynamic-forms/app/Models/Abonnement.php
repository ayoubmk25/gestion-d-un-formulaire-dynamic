<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Abonnement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'available_forms',
        'forms_to_create',
        'date_de_debut',
        'date_fin',
    ];

    /**
     * Get the company that owns the abonnement.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
