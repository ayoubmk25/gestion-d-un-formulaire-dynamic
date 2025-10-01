<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_template_id',
        'user_id',
        'assigned_by',
        'due_date',
        'is_completed',
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    public function formTemplate()
    {
        return $this->belongsTo(FormTemplate::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
