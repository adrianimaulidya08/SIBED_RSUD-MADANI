import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Profile.css';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roleLabels = { admin: 'Administrator', regular: 'Petugas Ruangan', intensive: 'Perawat ICU/Intensif' };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim()) { setError('Nama tidak boleh kosong.'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/profile', { name: name.trim() });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess('Nama berhasil diperbarui!');
    } catch (err) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Gagal menyimpan.');
      setError(msg);
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!currentPassword) { setError('Password lama wajib diisi.'); return; }
    if (newPassword.length < 6) { setError('Password baru minimal 6 karakter.'); return; }
    if (newPassword !== confirmPassword) { setError('Konfirmasi password tidak cocok.'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/profile', { current_password: currentPassword, password: newPassword });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess('Password berhasil diperbarui!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Gagal menyimpan.');
      setError(msg);
    } finally { setSaving(false); }
  };

  const EyeIcon = ({ show, onToggle }) => (
    <button type="button" className="pw-toggle" onClick={onToggle} title={show ? 'Sembunyikan' : 'Tampilkan'}>
      {show ? (
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
  );

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Back button */}
        <button className="profile-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Kembali ke Dashboard</span>
        </button>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1>{user?.name}</h1>
            <div className="profile-meta">
              <span className="profile-role-badge">{roleLabels[user?.role] || user?.role}</span>
              {user?.room && <span className="profile-room"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> {user.room.name}</span>}
            </div>
            <span className="profile-username">@{user?.username}</span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="profile-msg error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
        {success && (
          <div className="profile-msg success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {success}
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Card: Ubah Nama */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="card-icon icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <div className="card-header-text">
              <h2>Ubah Nama</h2>
              <p className="profile-card-desc">Nama ini akan ditampilkan di seluruh sistem.</p>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="profile-form">
            <div className="profile-field">
              <label htmlFor="profile-name">Nama Lengkap</label>
              <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama..." required />
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="btn-save" disabled={saving || name === user?.name}>
                {saving ? <span className="spinner-sm"></span> : 'Simpan Nama'}
              </button>
            </div>
          </form>
        </div>

        {/* Card: Ubah Password */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="card-icon icon-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <div className="card-header-text">
              <h2>Ubah Password</h2>
              <p className="profile-card-desc">Masukkan password lama dan password baru Anda.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="profile-field">
              <label htmlFor="current-pw">Password Lama</label>
              <div className="pw-wrapper">
                <input id="current-pw" type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Password saat ini..." required />
                <EyeIcon show={showCurrentPw} onToggle={() => setShowCurrentPw(!showCurrentPw)} />
              </div>
            </div>
            <div className="profile-field">
              <label htmlFor="new-pw">Password Baru</label>
              <div className="pw-wrapper">
                <input id="new-pw" type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter..." required minLength={6} />
                <EyeIcon show={showNewPw} onToggle={() => setShowNewPw(!showNewPw)} />
              </div>
            </div>
            <div className="profile-field">
              <label htmlFor="confirm-pw">Konfirmasi Password Baru</label>
              <input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru..." required minLength={6} />
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? <span className="spinner-sm"></span> : 'Ubah Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Card: Info Akun */}
        <div className="profile-card info-card">
          <div className="profile-card-header">
            <span className="card-icon icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </span>
            <div className="card-header-text">
              <h2>Informasi Akun</h2>
            </div>
          </div>
          <div className="info-grid">
            <div className="info-row"><span className="info-label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Username</span><span className="info-val mono">{user?.username}</span></div>
            <div className="info-row"><span className="info-label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Role</span><span className="info-val">{roleLabels[user?.role] || user?.role}</span></div>
            <div className="info-row"><span className="info-label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Ruangan</span><span className="info-val">{user?.room?.name || '-'}</span></div>
            <div className="info-row"><span className="info-label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Status</span><span className="info-val status-active"><span className="status-dot"></span>Aktif</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
