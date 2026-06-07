import { useState, useEffect } from 'react';
import './UserModal.css';

export default function UserModal({ isOpen, mode, user, rooms, users, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'regular',
    room_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        password: '',
        role: user.role || 'regular',
        room_id: user.room_id || '',
      });
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'regular',
        room_id: '',
      });
    }
    setError('');
    setShowPassword(false);
    setSaving(false);
  }, [mode, user, isOpen]);

  if (!isOpen) return null;

  // Filter available rooms for 'add' mode
  const usedRoomIds = users
    .filter((u) => u.room_id !== null)
    .map((u) => u.room_id);
  const availableRooms =
    mode === 'add'
      ? rooms.filter((r) => !usedRoomIds.includes(r.id))
      : rooms;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.username || formData.username.length < 3) {
      setError('Username harus minimal 3 karakter.');
      return;
    }
    if (mode === 'add' && (!formData.password || formData.password.length < 6)) {
      setError('Password harus minimal 6 karakter.');
      return;
    }
    if (mode === 'edit' && formData.password && formData.password.length < 6) {
      setError('Password harus minimal 6 karakter.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };
      // If password is empty in edit mode, remove it
      if (mode === 'edit' && !payload.password) {
        delete payload.password;
      }
      // Convert room_id to number or null
      payload.room_id = payload.room_id ? Number(payload.room_id) : null;
      await onSave(payload);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : 'Gagal menyimpan user.');
      setError(msg);
      setSaving(false);
    }
  };

  const allRoomsTaken = mode === 'add' && availableRooms.length === 0;

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="user-modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="user-modal-header">
          <h2>{mode === 'add' ? '➕ Tambah User Baru' : '✏️ Edit User'}</h2>
          <p className="user-modal-subtitle">
            {mode === 'add'
              ? 'Isi data untuk menambahkan user petugas baru.'
              : `Edit data user "${user?.username}".`}
          </p>
        </div>

        {error && <div className="user-modal-error">{error}</div>}

        {allRoomsTaken ? (
          <div className="user-modal-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Semua ruangan sudah memiliki petugas. Tambah ruangan baru terlebih dahulu.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="user-modal-form">
            <div className="user-form-group">
              <label htmlFor="user-room">Ruangan</label>
              {mode === 'edit' ? (
                <select id="user-room" value={formData.room_id} disabled className="input-disabled">
                  <option value="">— Tidak ada ruangan —</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  id="user-room"
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                >
                  <option value="">— Pilih Ruangan —</option>
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="user-form-group">
              <label htmlFor="user-name">Nama Lengkap</label>
              <input
                id="user-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap..."
                required
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="user-username">Username</label>
              <input
                id="user-username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username..."
                required
                minLength={3}
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="user-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    mode === 'edit'
                      ? 'Kosongkan jika tidak ingin mengubah password'
                      : 'Masukkan password (min 6 karakter)...'
                  }
                  {...(mode === 'add' ? { required: true, minLength: 6 } : {})}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="user-form-group">
              <label htmlFor="user-role">Hak Akses</label>
              <select
                id="user-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="regular">Regular (Petugas Ruangan)</option>
                <option value="intensive">Intensive (Perawat ICU/Intensif)</option>
              </select>
            </div>

            <div className="user-modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? <span className="spinner-sm"></span> : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
