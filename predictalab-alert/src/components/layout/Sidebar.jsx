import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const menuItems = [
    { name: 'Dashboard', path: user?.role === 'NCVET_ADMIN' ? '/policy-dashboard' : '/dashboard', icon: '📊', roles: ['NCVET_ADMIN', 'PRINCIPAL', 'TRAINING_OFFICER', 'ASSISTANT_TRAINING_OFFICER'] },
    { name: 'Map', path: '/map', icon: '🗺️', roles: ['NCVET_ADMIN', 'PRINCIPAL'] },
    { name: 'Branches', path: '/branches', icon: '👥', roles: ['NCVET_ADMIN', 'PRINCIPAL'] },
    { name: 'Complaints', path: '/complaints', icon: '⚠️', roles: ['NCVET_ADMIN', 'PRINCIPAL', 'TRAINING_OFFICER', 'ASSISTANT_TRAINING_OFFICER'] },
    { name: 'Maintenance', path: '/machines', icon: '🔧', roles: ['NCVET_ADMIN', 'PRINCIPAL', 'TRAINING_OFFICER'] },
    { name: 'Reports', path: '/policy-dashboard', icon: '📑', roles: ['NCVET_ADMIN'] },
    { name: 'Auction', path: '/machines', icon: '💼', roles: ['NCVET_ADMIN'] },
    { name: 'Manufacturers', path: '/machines', icon: '🏭', roles: ['NCVET_ADMIN'] },
    { name: 'Settings', path: '/dashboard', icon: '⚙️', roles: ['NCVET_ADMIN', 'PRINCIPAL', 'TRAINING_OFFICER', 'ASSISTANT_TRAINING_OFFICER'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/api/placeholder/40/40" alt="NCVET Logo" className="logo-image" />
          <div className="logo-text">
            <h2>National Council for Vocational Education and Training</h2>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredMenuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <img src="/api/placeholder/32/32" alt="User" />
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;