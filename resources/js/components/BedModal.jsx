import { useState } from 'react';
import './BedModal.css';

const statusLabels = {
  kosong: 'Kosong',
  terisi: 'Terisi',
  rencana_pulang: 'Rencana Pulang',
  discharge_planning: 'Discharge Planning',
};

const statusColors = {
  kosong: '#22c55e',
  terisi: '#ef4444',
  rencana_pulang: '#eab308',
  discharge_planning: '#3b82f6',
};

export default function BedModal({ bed, canEdit, isAdmin, onClose, onUpdate }) {
  const [status, setStatus] = useState(bed.status);
  const [deskripsi, setDeskripsi] = useState(bed.deskripsi || '');
  const [isIsolation, setIsIsolation] = useState(bed.is_isolation || false);
  const [isVentilator, setIsVentilator] = useState(bed.is_ventilator || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { status, deskripsi };
      if (isAdmin) {
        payload.is_isolation = isIsolation;
        payload.is_ventilator = isVentilator;
      }
      await onUpdate(bed.id, payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan perubahan.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="modal-header">
          <div className="modal-title-row">
            <h2>{bed.code}</h2>
            <span
              className="modal-status-badge"
              style={{ '--status-color': statusColors[bed.status] }}
            >
              {statusLabels[bed.status]}
            </span>
          </div>
          <p className="modal-subtitle">
            {bed.room_class?.room?.name} • {bed.room_class?.name}
          </p>
        </div>

        <div className="modal-info-grid">
          <div className="info-item">
            <span className="info-label">Ventilator</span>
            <span className={`info-value ${bed.is_ventilator ? 'yes' : 'no'}`}>
              {bed.is_ventilator ? 'Ya' : 'Tidak'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Isolasi</span>
            <span className={`info-value ${bed.is_isolation ? 'yes' : 'no'}`}>
              {bed.is_isolation ? 'Ya' : 'Tidak'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Diperbarui oleh</span>
            <span className="info-value">{bed.updated_by || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Terakhir update</span>
            <span className="info-value">
              {bed.updated_at ? new Date(bed.updated_at).toLocaleString('id-ID') : '-'}
            </span>
          </div>
        </div>

        {canEdit ? (
          <div className="modal-edit-section">
            <h3>Edit Bed</h3>

            {error && <div className="modal-error">{error}</div>}

            <div className="form-group">
              <label>Status</label>
              <div className="status-options">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <button
                    key={value}
                    className={`status-option ${status === value ? 'active' : ''}`}
                    style={{ '--opt-color': statusColors[value] }}
                    onClick={() => setStatus(value)}
                    type="button"
                  >
                    <span className="status-dot" style={{ background: statusColors[value] }}></span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin-only: Isolation & Ventilator toggles */}
            {isAdmin && (
              <div className="form-group">
                <label>Pengaturan Bed (Admin)</label>
                <div className="toggle-options">
                  <label className={`toggle-option ${isIsolation ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isIsolation}
                      onChange={(e) => setIsIsolation(e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    <span className="toggle-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Isolasi
                    </span>
                  </label>
                  <label className={`toggle-option ${isVentilator ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isVentilator}
                      onChange={(e) => setIsVentilator(e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    <span className="toggle-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v6m0 8v6m-6-10H2m20 0h-4M7.8 7.8 4.6 4.6m14.8 14.8-3.2-3.2M7.8 16.2l-3.2 3.2M19.4 4.6l-3.2 3.2"/>
                      </svg>
                      Ventilator
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="deskripsi">Deskripsi / Catatan</label>
              <textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tambahkan catatan..."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Batal</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner-sm"></span> : 'Simpan'}
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-readonly">
            <div className="readonly-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Anda hanya dapat melihat bed ini (bukan ruangan Anda)
            </div>
            {bed.deskripsi && (
              <div className="readonly-desc">
                <label>Deskripsi:</label>
                <p>{bed.deskripsi}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
