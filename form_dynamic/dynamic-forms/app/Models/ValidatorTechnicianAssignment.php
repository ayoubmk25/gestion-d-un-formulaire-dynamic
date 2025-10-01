<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ValidatorTechnicianAssignment extends Model
{
    use HasFactory;

    protected $table = 'validator_technician_assignments';

    protected $fillable = [
        'form_template_id',
        'validator_id',
        'technician_id',
    ];

    // Define relationships if necessary (e.g., to FormTemplate, Validator, Technician)
    public function formTemplate()
    {
        return $this->belongsTo(FormTemplate::class);
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validator_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
