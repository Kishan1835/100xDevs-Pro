import React, { useState, useEffect } from 'react';
import { fetchBranches } from '../../services/api';

const MapView = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [mapView, setMapView] = useState('satellite');

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await fetchBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error loading branches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10b981'; // green
      case 'maintenance':
        return '#f59e0b'; // orange
      case 'inactive':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="page-container map-page">
      <div className="page-header">
        <div className="header-content">
          <h1>ITI Network Map</h1>
          <p>Geographic overview of all ITI branches</p>
        </div>
        <div className="header-actions">
          <select 
            value={mapView}
            onChange={(e) => setMapView(e.target.value)}
            className="map-view-selector"
          >
            <option value="satellite">Satellite View</option>
            <option value="roadmap">Road Map</option>
            <option value="terrain">Terrain</option>
          </select>
          <button className="btn btn-outline">Export Map</button>
          <button className="btn btn-primary">Add Location</button>
        </div>
      </div>

      <div className="map-container-wrapper">
        <div className="map-sidebar">
          <div className="map-legend">
            <h3>Branch Status</h3>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-marker active"></div>
                <span>Active ({branches.filter(b => b.status === 'Active').length})</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker maintenance"></div>
                <span>Maintenance ({branches.filter(b => b.status === 'Maintenance').length})</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker inactive"></div>
                <span>Inactive ({branches.filter(b => b.status === 'Inactive').length})</span>
              </div>
            </div>
          </div>

          <div className="branch-list-panel">
            <h3>All Branches ({branches.length})</h3>
            <div className="branches-list">
              {branches.map(branch => (
                <div 
                  key={branch.id}
                  className={`branch-list-item ${selectedBranch?.id === branch.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBranch(branch)}
                >
                  <div className="branch-marker-mini" style={{ backgroundColor: getStatusColor(branch.status) }}></div>
                  <div className="branch-info">
                    <h4>{branch.name}</h4>
                    <p>{branch.address}</p>
                    <div className="branch-quick-stats">
                      <span>👥 {branch.students}</span>
                      <span>⚙️ {branch.totalMachines}</span>
                      <span>👨‍🏫 {branch.workforce}</span>
                    </div>
                  </div>
                  <div className={`status-indicator ${branch.status.toLowerCase()}`}>
                    {branch.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="map-main">
          <div className="map-container">
            {/* Interactive Map Placeholder - In a real app, you'd use Google Maps, Mapbox, etc. */}
            <div className="map-placeholder">
              <iframe
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src="https://www.openstreetmap.org/export/embed.html?bbox=68.1766451354%2C7.96553477623%2C97.4025614766%2C35.4940095078&layer=mapnik&marker=28.7041%2C77.1025"
                title="ITI Network Map"
                className="interactive-map"
              ></iframe>
              
              {/* Overlay markers for branches */}
              <div className="map-markers">
                {branches.map((branch, index) => (
                  <div
                    key={branch.id}
                    className={`map-marker ${selectedBranch?.id === branch.id ? 'selected' : ''}`}
                    style={{
                      left: `${20 + (index * 15) % 80}%`,
                      top: `${30 + (index * 10) % 40}%`,
                      backgroundColor: getStatusColor(branch.status)
                    }}
                    onClick={() => setSelectedBranch(branch)}
                    title={branch.name}
                  >
                    <div className="marker-dot"></div>
                    <div className="marker-label">{branch.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch Details Panel */}
          {selectedBranch && (
            <div className="branch-details-panel">
              <div className="panel-header">
                <h3>{selectedBranch.name}</h3>
                <button 
                  className="close-panel"
                  onClick={() => setSelectedBranch(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="panel-content">
                <div className="detail-section">
                  <h4>Location Details</h4>
                  <p><strong>Address:</strong> {selectedBranch.address}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge status-${selectedBranch.status.toLowerCase()}`}>
                      {selectedBranch.status}
                    </span>
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Quick Stats</h4>
                  <div className="stats-mini-grid">
                    <div className="stat-mini">
                      <span className="stat-icon">⚙️</span>
                      <div className="stat-info">
                        <span className="stat-value">{selectedBranch.totalMachines}</span>
                        <span className="stat-label">Machines</span>
                      </div>
                    </div>
                    
                    <div className="stat-mini">
                      <span className="stat-icon">✅</span>
                      <div className="stat-info">
                        <span className="stat-value">{selectedBranch.workingMachines}</span>
                        <span className="stat-label">Working</span>
                      </div>
                    </div>
                    
                    <div className="stat-mini">
                      <span className="stat-icon">👥</span>
                      <div className="stat-info">
                        <span className="stat-value">{selectedBranch.students}</span>
                        <span className="stat-label">Students</span>
                      </div>
                    </div>
                    
                    <div className="stat-mini">
                      <span className="stat-icon">👨‍🏫</span>
                      <div className="stat-info">
                        <span className="stat-value">{selectedBranch.workforce}</span>
                        <span className="stat-label">Staff</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Performance</h4>
                  <div className="performance-indicator">
                    <span>Machine Efficiency</span>
                    <div className="progress-bar-mini">
                      <div 
                        className="progress-fill-mini"
                        style={{ 
                          width: `${(selectedBranch.workingMachines / selectedBranch.totalMachines) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span>{Math.round((selectedBranch.workingMachines / selectedBranch.totalMachines) * 100)}%</span>
                  </div>
                </div>

                <div className="panel-actions">
                  <button className="btn btn-outline btn-sm">
                    View Details
                  </button>
                  <button className="btn btn-primary btn-sm">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Statistics */}
      <div className="map-statistics">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Network Overview</h3>
          </div>
          <div className="network-stats">
            <div className="network-stat">
              <div className="stat-icon">🏢</div>
              <div className="stat-details">
                <span className="stat-value">{branches.length}</span>
                <span className="stat-label">Total Branches</span>
              </div>
            </div>
            
            <div className="network-stat">
              <div className="stat-icon">👥</div>
              <div className="stat-details">
                <span className="stat-value">
                  {branches.reduce((total, branch) => total + branch.students, 0).toLocaleString()}
                </span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>
            
            <div className="network-stat">
              <div className="stat-icon">⚙️</div>
              <div className="stat-details">
                <span className="stat-value">
                  {branches.reduce((total, branch) => total + branch.totalMachines, 0)}
                </span>
                <span className="stat-label">Total Machines</span>
              </div>
            </div>
            
            <div className="network-stat">
              <div className="stat-icon">📊</div>
              <div className="stat-details">
                <span className="stat-value">
                  {Math.round(
                    branches.reduce((total, branch) => total + (branch.workingMachines / branch.totalMachines), 0) 
                    / branches.length * 100
                  )}%
                </span>
                <span className="stat-label">Avg Efficiency</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;