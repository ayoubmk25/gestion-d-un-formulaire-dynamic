<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_template_id',
        'user_id',
        'form_data',
        'status',
        'validated_by',
        'validated_at',
        'location_data',
    ];

    protected $casts = [
        'form_data' => 'array',
        'validated_at' => 'datetime',
        'location_data' => 'json',
    ];

    public function formTemplate()
    {
        return $this->belongsTo(FormTemplate::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
