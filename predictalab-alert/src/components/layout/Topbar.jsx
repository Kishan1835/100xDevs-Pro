import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NcvetLogo from '../../assets/logo_ncv.png.png';
import G20Logo from '../../assets/logo_g20.png.png';

const Topbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="topbar">
      <div className="brand-left">
        <div className="ncvet-brand">
          <img src={NcvetLogo} alt="NCVET" className="ncvet-logo-img" />
          <div className="ncvet-text">
            <h3>National Council for Vocational Education and Training</h3>
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input large"
            />
            <button type="submit" className="search-button">🔍</button>
          </div>
        </form>
      </div>

      <div className="topbar-right">
        <div className="g20-logo-wrap">
          <img src={G20Logo} alt="G20" className="g20-logo-img" />
        </div>
        <div className="topbar-actions">
          <button className="action-button settings-btn" title="Filters">
            <span className="icon">⚙️</span>
          </button>
          <div className="user-profile">
            <div className="profile-avatar">
              <img src="/api/placeholder/36/36" alt="Profile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;