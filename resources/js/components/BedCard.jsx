import './BedCard.css';

const statusLabels = {
  kosong: 'Kosong',
  terisi: 'Terisi',
  rencana_pulang: 'Rencana Pulang',
  discharge_planning: 'Discharge Planning',
};

export default function BedCard({ bed, canEdit, onClick }) {
  return (
    <div
      className={`bed-card status-bg-${bed.status} ${canEdit ? 'editable' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="bed-card-header">
        <span className="bed-code">{bed.code}</span>
        <div className="bed-badges">
          {bed.is_ventilator && (
            <span className="badge badge-ventilator" title="Ventilator">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v6m0 8v6m-6-10H2m20 0h-4M7.8 7.8 4.6 4.6m14.8 14.8-3.2-3.2M7.8 16.2l-3.2 3.2M19.4 4.6l-3.2 3.2"/>
              </svg>
              V
            </span>
          )}
          {bed.is_isolation && (
            <span className="badge badge-isolation" title="Isolasi">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              I
            </span>
          )}
        </div>
      </div>

      <div className="bed-card-status">
        <span className={`status-indicator status-${bed.status}`}></span>
        <span className="status-text">{statusLabels[bed.status]}</span>
      </div>

      {bed.deskripsi && (
        <p className="bed-description">{bed.deskripsi}</p>
      )}

      <div className="bed-card-footer">
        {bed.updated_by && (
          <span className="updated-info">
            {bed.updated_by}
          </span>
        )}
        {canEdit && (
          <span className="edit-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
