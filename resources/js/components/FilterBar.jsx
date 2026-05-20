import './FilterBar.css';

export default function FilterBar({ filters, onFilterChange, classes }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Status</label>
        <select value={filters.status} onChange={(e) => handleChange('status', e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="kosong">Kosong</option>
          <option value="terisi">Terisi</option>
          <option value="rencana_pulang">Rencana Pulang</option>
          <option value="discharge_planning">Discharge Planning</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Kelas</label>
        <select value={filters.class_id} onChange={(e) => handleChange('class_id', e.target.value)}>
          <option value="all">Semua Kelas</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Ventilator</label>
        <select value={filters.is_ventilator} onChange={(e) => handleChange('is_ventilator', e.target.value)}>
          <option value="">Semua</option>
          <option value="true">Dengan Ventilator</option>
          <option value="false">Tanpa Ventilator</option>
        </select>
      </div>

      {(filters.status !== 'all' || filters.class_id !== 'all' || filters.is_ventilator !== '') && (
        <button className="filter-clear" onClick={() => onFilterChange({ status: 'all', class_id: 'all', is_ventilator: '' })}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Reset
        </button>
      )}
    </div>
  );
}
