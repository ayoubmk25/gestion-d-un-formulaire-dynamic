<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'fields',
        'company_id',
        'created_by',
        'is_active',
    ];

    protected $casts = [
        'fields' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions()
    {
        return $this->hasMany(FormSubmission::class);
    }

    public function assignments()
    {
        return $this->hasMany(FormAssignment::class);
    }
}

