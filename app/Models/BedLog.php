<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class BedLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'bed_id',
        'old_status',
        'new_status',
        'old_deskripsi',
        'new_deskripsi',
        'changed_by',
    ];

    /**
     * Get the bed that owns this log.
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }
}
