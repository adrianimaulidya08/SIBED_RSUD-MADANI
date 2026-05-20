<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Bed extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_id',
        'code',
        'is_ventilator',
        'is_isolation',
        'status',
        'deskripsi',
        'updated_by',
    ];

    protected $casts = [
        'is_ventilator' => 'boolean',
        'is_isolation' => 'boolean',
    ];

    /**
     * Get the class that owns this bed.
     */
    public function roomClass(): BelongsTo
    {
        return $this->belongsTo(RoomClass::class, 'class_id');
    }

    /**
     * Get the logs for this bed.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(BedLog::class);
    }
}
