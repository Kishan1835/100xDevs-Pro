import React from 'react';

const MapPage = () => {
  return (
    <div className="page-container">
      <div className="dashboard-header"><h1>Map</h1></div>
      <div className="page-filters">
        <div className="filter-section">
          <div className="filter-group"><label>City</label><select className="filter-select"><option>Chennai</option></select></div>
          <div className="filter-group"><label>State</label><select className="filter-select"><option>Tamil Nadu</option></select></div>
          <div className="filter-group"><label>District</label><select className="filter-select"><option>Chennai</option></select></div>
          <div className="filter-group"><label>Severity</label><select className="filter-select"><option>All</option></select></div>
          <div className="filter-group"><label>Manufacturer</label><select className="filter-select"><option>All</option></select></div>
        </div>
      </div>
      <div className="dashboard-card map-card" style={{ gridColumn: 'span 12' }}>
        <div className="map-container">
          <iframe
            width="100%"
            height="520"
            frameBorder="0"
            scrolling="no"
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.1%2C28.4%2C77.3%2C28.7&layer=mapnik"
            title="Map"
          ></iframe>
        </div>
      </div>
      <div className="stats-grid">
        <div className="dashboard-card"><h3>Total Issues</h3><p>24</p></div>
        <div className="dashboard-card"><h3>Reported</h3><p>1 New</p></div>
        <div className="dashboard-card"><h3>In Progress</h3><p>5 Progressing</p></div>
        <div className="dashboard-card"><h3>Total Resolved</h3><p>8 Done</p></div>
      </div>
    </div>
  );
};

export default MapPage;
