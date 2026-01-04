import React from 'react';

const ITICard = ({ iti }) => {
  const statusClass = (status) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'status-success';
    if (s === 'critical') return 'status-danger';
    if (s === 'maintenance') return 'status-warning';
    return 'status-default';
  };

  return (
    <div className="iti-card">
      <div className="iti-card-header">
        <div>
          <h4 className="iti-name">{iti.name}</h4>
          <p className="iti-address">{iti.address}</p>
        </div>
        <span className={`status-badge ${statusClass(iti.status)}`}>{iti.status}</span>
      </div>
      <div className="iti-stats">
        <div className="stat">
          <span className="label">Total Machines</span>
          <span className="value">{iti.totalMachines}</span>
        </div>
        <div className="stat">
          <span className="label">Working Machines</span>
          <span className="value">{iti.workingMachines}</span>
        </div>
        <div className="stat">
          <span className="label">Students</span>
          <span className="value">{iti.students}</span>
        </div>
        <div className="stat">
          <span className="label">Workforce</span>
          <span className="value">{iti.workforce}</span>
        </div>
      </div>
      <div className="iti-card-footer">
        <a href={`/branches/${iti.id}`} className="btn btn-outline btn-sm">View Full Details➤</a>
      </div>
    </div>
  );
};

export default ITICard;
