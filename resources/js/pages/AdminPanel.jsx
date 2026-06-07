import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import UserModal from '../components/UserModal';
import './AdminPanel.css';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('rooms');

  // Room/Class/Bed states (existing)
  const [rooms, setRooms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomForm, setRoomForm] = useState({ name: '', category: 'general' });
  const [classForm, setClassForm] = useState({ name: '' });
  const [bedForm, setBedForm] = useState({ code: '', is_ventilator: false, is_isolation: false });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // User management states
  const [users, setUsers] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  useEffect(() => { fetchRooms(); }, []);

  useEffect(() => {
    if (activeMenu === 'users') fetchUsers();
  }, [activeMenu]);

  useEffect(() => {
    if (selectedRoom) { fetchClasses(selectedRoom.id); } else { setClasses([]); setSelectedClass(null); }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedClass) { fetchBeds(selectedClass.id); } else { setBeds([]); }
  }, [selectedClass]);

  // ===== DATA FETCHING =====
  const fetchRooms = async () => {
    try { setLoading(true); const { data } = await api.get('/admin/rooms'); setRooms(data); }
    catch (err) { console.error('Failed to fetch rooms:', err); }
    finally { setLoading(false); }
  };
  const fetchClasses = async (roomId) => {
    try { const { data } = await api.get(`/admin/rooms/${roomId}/classes`); setClasses(data); }
    catch (err) { console.error('Failed to fetch classes:', err); }
  };
  const fetchBeds = async (classId) => {
    try { const { data } = await api.get('/beds', { params: { class_id: classId } }); setBeds(data); }
    catch (err) { console.error('Failed to fetch beds:', err); }
  };
  const fetchUsers = async () => {
    try { const { data } = await api.get('/admin/users'); setUsers(data); }
    catch (err) { console.error('Failed to fetch users:', err); }
  };

  const clearMessages = () => { setFormError(''); setFormSuccess(''); };

  // ===== ROOM ACTIONS =====
  const handleAddRoom = async (e) => {
    e.preventDefault(); clearMessages();
    try {
      await api.post('/admin/rooms', roomForm);
      setFormSuccess(`Ruangan "${roomForm.name}" berhasil ditambahkan!`);
      setRoomForm({ name: '', category: 'general' }); fetchRooms();
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menambahkan ruangan.'); }
  };
  const handleDeleteRoom = async (room) => {
    if (!confirm(`Hapus ruangan "${room.name}"? Semua kelas dan bed di dalamnya akan ikut terhapus.`)) return;
    clearMessages();
    try {
      await api.delete(`/admin/rooms/${room.id}`);
      setFormSuccess(`Ruangan "${room.name}" berhasil dihapus.`);
      if (selectedRoom?.id === room.id) setSelectedRoom(null);
      fetchRooms();
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menghapus ruangan.'); }
  };

  // ===== CLASS ACTIONS =====
  const handleAddClass = async (e) => {
    e.preventDefault(); if (!selectedRoom) return; clearMessages();
    try {
      await api.post(`/admin/rooms/${selectedRoom.id}/classes`, classForm);
      setFormSuccess(`Kelas "${classForm.name}" berhasil ditambahkan!`);
      setClassForm({ name: '' }); fetchClasses(selectedRoom.id);
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menambahkan kelas.'); }
  };
  const handleDeleteClass = async (cls) => {
    if (!confirm(`Hapus kelas "${cls.name}"? Semua bed di dalamnya akan ikut terhapus.`)) return;
    clearMessages();
    try {
      await api.delete(`/admin/classes/${cls.id}`);
      setFormSuccess(`Kelas "${cls.name}" berhasil dihapus.`);
      if (selectedClass?.id === cls.id) setSelectedClass(null);
      fetchClasses(selectedRoom.id);
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menghapus kelas.'); }
  };

  // ===== BED ACTIONS =====
  const handleAddBed = async (e) => {
    e.preventDefault(); if (!selectedClass) return; clearMessages();
    try {
      await api.post('/admin/beds', { ...bedForm, class_id: selectedClass.id });
      setFormSuccess(`Bed "${bedForm.code}" berhasil ditambahkan!`);
      setBedForm({ code: '', is_ventilator: false, is_isolation: false }); fetchBeds(selectedClass.id);
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menambahkan bed.'); }
  };
  const handleToggleBedField = async (bed, field) => {
    clearMessages();
    try {
      await api.put(`/admin/beds/${bed.id}`, { [field]: !bed[field] });
      setFormSuccess(`Bed "${bed.code}" berhasil diperbarui.`); fetchBeds(selectedClass.id);
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal memperbarui bed.'); }
  };
  const handleDeleteBed = async (bed) => {
    if (!confirm(`Hapus bed "${bed.code}"?`)) return; clearMessages();
    try {
      await api.delete(`/admin/beds/${bed.id}`);
      setFormSuccess(`Bed "${bed.code}" berhasil dihapus.`); fetchBeds(selectedClass.id);
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menghapus bed.'); }
  };

  // ===== USER ACTIONS =====
  const handleAddUser = () => { setSelectedUser(null); setUserModalMode('add'); setUserModalOpen(true); };
  const handleEditUser = (u) => { setSelectedUser(u); setUserModalMode('edit'); setUserModalOpen(true); };
  const handleSaveUser = async (formData) => {
    if (userModalMode === 'add') {
      await api.post('/admin/users', formData);
    } else {
      await api.put(`/admin/users/${selectedUser.id}`, formData);
    }
    setUserModalOpen(false); setSelectedUser(null); fetchUsers();
    setFormSuccess(userModalMode === 'add' ? 'User berhasil ditambahkan!' : 'User berhasil diperbarui!');
  };
  const handleToggleActive = async (u) => {
    if (u.is_active && !confirm(`Nonaktifkan user "${u.username}"? User tidak akan bisa login.`)) return;
    clearMessages();
    try {
      const { data } = await api.patch(`/admin/users/${u.id}/toggle-active`);
      setFormSuccess(data.message); fetchUsers();
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal mengubah status user.'); }
  };
  const handleDeleteUser = async (u) => {
    if (!confirm(`Hapus user "${u.username}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    clearMessages();
    try {
      await api.delete(`/admin/users/${u.id}`);
      setFormSuccess(`User "${u.username}" berhasil dihapus.`); fetchUsers();
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menghapus user.'); }
  };

  const categoryLabels = { general: 'Umum', intensive: 'Intensif', psychiatric: 'Jiwa' };
  const categoryColors = { general: '#22c55e', intensive: '#ef4444', psychiatric: '#a855f7' };
  const statusLabels = { kosong: 'Kosong', terisi: 'Terisi', rencana_pulang: 'Renc. Pulang', discharge_planning: 'Discharge' };
  const statusColors = { kosong: '#22c55e', terisi: '#ef4444', rencana_pulang: '#eab308', discharge_planning: '#3b82f6' };

  return (
    <div className="admin-panel">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div>
            <h1>Admin Panel</h1>
            <span className="admin-subtitle">Kelola Ruangan, Kelas, Tempat Tidur & User</span>
          </div>
        </div>
        <div className="admin-header-right">
          <div className="user-badge"><span className="badge-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span><span>{user?.name}</span></div>
          <button onClick={logout} className="logout-btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="admin-tabs">
        <button className={`admin-tab ${activeMenu === 'rooms' ? 'active' : ''}`} onClick={() => setActiveMenu('rooms')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Kelola Ruangan
        </button>
        <button className={`admin-tab ${activeMenu === 'users' ? 'active' : ''}`} onClick={() => setActiveMenu('users')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Kelola User
        </button>
      </nav>

      {/* Messages */}
      {formError && (
        <div className="admin-message error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {formError}
          <button onClick={() => setFormError('')}>×</button>
        </div>
      )}
      {formSuccess && (
        <div className="admin-message success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {formSuccess}
          <button onClick={() => setFormSuccess('')}>×</button>
        </div>
      )}

      {/* Body */}
      <div className="admin-body">
        {activeMenu === 'rooms' && (
          <div className="admin-content">
            {/* Column 1: Rooms */}
            <div className="admin-column">
              <div className="column-header"><h2><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Ruangan</h2><span className="count-badge">{rooms.length}</span></div>
              <form onSubmit={handleAddRoom} className="add-form">
                <input type="text" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} placeholder="Nama ruangan..." required />
                <select value={roomForm.category} onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}>
                  <option value="general">Umum</option><option value="intensive">Intensif</option><option value="psychiatric">Jiwa</option>
                </select>
                <button type="submit" className="btn-add">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Tambah
                </button>
              </form>
              <div className="item-list">
                {rooms.map((room) => (
                  <div key={room.id} className={`item-card ${selectedRoom?.id === room.id ? 'active' : ''}`} onClick={() => { setSelectedRoom(room); setSelectedClass(null); }}>
                    <div className="item-info">
                      <span className="item-dot" style={{ background: categoryColors[room.category] }}></span>
                      <div><span className="item-name">{room.name}</span><span className="item-meta">{categoryLabels[room.category]} • {room.classes_count || 0} kelas</span></div>
                    </div>
                    <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room); }} title="Hapus">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
                {rooms.length === 0 && !loading && <div className="empty-hint">Belum ada ruangan. Tambahkan di atas.</div>}
              </div>
            </div>

            {/* Column 2: Classes */}
            <div className={`admin-column ${!selectedRoom ? 'disabled' : ''}`}>
              <div className="column-header"><h2><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> Kelas</h2>{selectedRoom && <span className="count-badge">{classes.length}</span>}</div>
              {selectedRoom ? (<>
                <div className="column-context"><span className="context-dot" style={{ background: categoryColors[selectedRoom.category] }}></span>{selectedRoom.name}</div>
                <form onSubmit={handleAddClass} className="add-form">
                  <input type="text" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="Nama kelas (VIP, Kelas 1...)" required />
                  <button type="submit" className="btn-add">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah
                  </button>
                </form>
                <div className="item-list">
                  {classes.map((cls) => (
                    <div key={cls.id} className={`item-card ${selectedClass?.id === cls.id ? 'active' : ''}`} onClick={() => setSelectedClass(cls)}>
                      <div className="item-info"><span className="item-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span><div><span className="item-name">{cls.name}</span><span className="item-meta">{cls.beds_count || 0} bed</span></div></div>
                      <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls); }} title="Hapus">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                  {classes.length === 0 && <div className="empty-hint">Belum ada kelas di ruangan ini.</div>}
                </div>
              </>) : (<div className="column-placeholder"><span className="placeholder-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span><p>Pilih ruangan terlebih dahulu</p></div>)}
            </div>

            {/* Column 3: Beds */}
            <div className={`admin-column ${!selectedClass ? 'disabled' : ''}`}>
              <div className="column-header"><h2><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg> Tempat Tidur</h2>{selectedClass && <span className="count-badge">{beds.length}</span>}</div>
              {selectedClass ? (<>
                <div className="column-context"><span className="context-dot" style={{ background: categoryColors[selectedRoom.category] }}></span>{selectedRoom.name} → {selectedClass.name}</div>
                <form onSubmit={handleAddBed} className="add-form bed-form">
                  <input type="text" value={bedForm.code} onChange={(e) => setBedForm({ ...bedForm, code: e.target.value })} placeholder="Kode bed (ICU-V-01...)" required />
                  <div className="form-toggles">
                    <label className={`mini-toggle ${bedForm.is_ventilator ? 'on' : ''}`}><input type="checkbox" checked={bedForm.is_ventilator} onChange={(e) => setBedForm({ ...bedForm, is_ventilator: e.target.checked })} /><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg> Ventilator</label>
                    <label className={`mini-toggle ${bedForm.is_isolation ? 'on' : ''}`}><input type="checkbox" checked={bedForm.is_isolation} onChange={(e) => setBedForm({ ...bedForm, is_isolation: e.target.checked })} /><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Isolasi</label>
                  </div>
                  <button type="submit" className="btn-add">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Bed
                  </button>
                </form>
                <div className="item-list">
                  {beds.map((bed) => (
                    <div key={bed.id} className="item-card bed-item">
                      <div className="item-info"><span className="bed-status-dot" style={{ background: statusColors[bed.status] }}></span><div><span className="item-name">{bed.code}</span><span className="item-meta">{statusLabels[bed.status]}</span></div></div>
                      <div className="bed-actions">
                        <button className={`toggle-mini-btn ${bed.is_ventilator ? 'active' : ''}`} onClick={() => handleToggleBedField(bed, 'is_ventilator')} title={bed.is_ventilator ? 'Nonaktifkan Ventilator' : 'Aktifkan Ventilator'}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg></button>
                        <button className={`toggle-mini-btn ${bed.is_isolation ? 'active' : ''}`} onClick={() => handleToggleBedField(bed, 'is_isolation')} title={bed.is_isolation ? 'Nonaktifkan Isolasi' : 'Aktifkan Isolasi'}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
                        <button className="btn-delete" onClick={() => handleDeleteBed(bed)} title="Hapus">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {beds.length === 0 && <div className="empty-hint">Belum ada bed di kelas ini.</div>}
                </div>
              </>) : (<div className="column-placeholder"><span className="placeholder-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg></span><p>Pilih kelas terlebih dahulu</p></div>)}
            </div>
          </div>
        )}

        {activeMenu === 'users' && (
          <div className="users-panel">
            <div className="users-panel-header">
              <h2><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Kelola User Ruangan</h2>
              <button className="btn-add" onClick={handleAddUser}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah User
              </button>
            </div>
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>No</th><th>Ruangan</th><th>Username</th><th>Nama</th><th>Role</th><th>Status</th><th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="7" className="empty-hint">Belum ada user petugas.</td></tr>
                  ) : users.map((u, idx) => (
                    <tr key={u.id}>
                      <td>{idx + 1}</td>
                      <td>{u.room?.name || '-'}</td>
                      <td className="username-cell">{u.username}</td>
                      <td>{u.name}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role === 'regular' ? 'Regular' : 'Intensive'}
                        </span>
                      </td>
                      <td>
                        <label className="toggle-switch-active" title={u.is_active ? 'Aktif — klik untuk nonaktifkan' : 'Nonaktif — klik untuk aktifkan'}>
                          <input type="checkbox" checked={u.is_active} onChange={() => handleToggleActive(u)} />
                          <span className="toggle-slider"></span>
                          <span className={`toggle-status-label ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Aktif' : 'Nonaktif'}</span>
                        </label>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button className="btn-edit" onClick={() => handleEditUser(u)} title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteUser(u)} title="Hapus">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={userModalOpen}
        mode={userModalMode}
        user={selectedUser}
        rooms={rooms}
        users={users}
        onClose={() => { setUserModalOpen(false); setSelectedUser(null); }}
        onSave={handleSaveUser}
      />
    </div>
  );
}
