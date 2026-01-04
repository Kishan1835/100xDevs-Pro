import React from 'react';

const MachineCard = ({ machine, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'working':
        return 'status-success';
      case 'under maintenance':
        return 'status-warning';
      case 'faulty':
        return 'status-danger';
      default:
        return 'status-default';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'efficiency-excellent';
    if (efficiency >= 75) return 'efficiency-good';
    if (efficiency >= 60) return 'efficiency-average';
    return 'efficiency-poor';
  };

  return (
    <div className="machine-card">
      <div className="machine-card-header">
        <div className="machine-info">
          <h4 className="machine-name">{machine.name}</h4>
          <p className="machine-type">{machine.type}</p>
        </div>
        <div className={`machine-status ${getStatusColor(machine.status)}`}>
          {machine.status}
        </div>
      </div>

      <div className="machine-card-body">
        <div className="machine-details">
          <div className="detail-row">
            <span className="detail-label">Branch:</span>
            <span className="detail-value">{machine.branchName}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Last Maintenance:</span>
            <span className="detail-value">
              {new Date(machine.lastMaintenance).toLocaleDateString()}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Next Maintenance:</span>
            <span className="detail-value">
              {new Date(machine.nextMaintenance).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="efficiency-section">
          <div className="efficiency-label">Efficiency</div>
          <div className="efficiency-bar">
            <div 
              className={`efficiency-progress ${getEfficiencyColor(machine.efficiency)}`}
              style={{ width: `${machine.efficiency}%` }}
            ></div>
          </div>
          <div className="efficiency-value">{machine.efficiency}%</div>
        </div>
      </div>

      <div className="machine-card-footer">
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onViewDetails(machine)}
        >
          View Details
        </button>
        <button className="btn btn-outline btn-sm">
          Schedule Maintenance
        </button>
      </div>
    </div>
  );
};

export default MachineCard;