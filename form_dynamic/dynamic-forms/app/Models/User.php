<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'company_id',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }


    public function assignedForms()
    {
        return $this->hasMany(FormAssignment::class);
    }

    public function formSubmissions()
    {
        return $this->hasMany(FormSubmission::class);
    }

    public function isRoot()
    {
        return $this->role === 'root';
    }

    public function isAdmin()
    {
        return $this->role === 'administrator';
    }

    public function isTechnician()
    {
        return $this->role === 'technician';
    }

    public function isValidator()
    {
        return $this->role === 'validator';
    }
}
