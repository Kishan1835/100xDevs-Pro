import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBranches } from '../../services/api';

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
        return 'status-success';
      case 'maintenance':
        return 'status-warning';
      case 'inactive':
        return 'status-danger';
      default:
        return 'status-default';
    }
  };

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || branch.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading ITI branches...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>ITI Branches</h1>
          <p>Manage and monitor all ITI branches across the network</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            + Add New Branch
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="page-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search branches by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn btn-outline">Export List</button>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="branches-grid">
        {filteredBranches.map(branch => (
          <div key={branch.id} className="branch-card">
            <div className="branch-card-header">
              <div className="branch-info">
                <h3 className="branch-name">{branch.name}</h3>
                <p className="branch-address">{branch.address}</p>
              </div>
              <div className={`branch-status ${getStatusColor(branch.status)}`}>
                {branch.status}
              </div>
            </div>

            <div className="branch-card-body">
              <div className="branch-stats">
                <div className="stat-item">
                  <div className="stat-icon">⚙️</div>
                  <div className="stat-details">
                    <span className="stat-value">{branch.totalMachines}</span>
                    <span className="stat-label">Total Machines</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">✅</div>
                  <div className="stat-details">
                    <span className="stat-value">{branch.workingMachines}</span>
                    <span className="stat-label">Working</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">👥</div>
                  <div className="stat-details">
                    <span className="stat-value">{branch.students}</span>
                    <span className="stat-label">Students</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">👨‍🏫</div>
                  <div className="stat-details">
                    <span className="stat-value">{branch.workforce}</span>
                    <span className="stat-label">Workforce</span>
                  </div>
                </div>
              </div>

              <div className="branch-metrics">
                <div className="efficiency-metric">
                  <span className="metric-label">Machine Efficiency</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(branch.workingMachines / branch.totalMachines) * 100}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">
                    {Math.round((branch.workingMachines / branch.totalMachines) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="branch-card-footer">
              <div className="last-updated">
                Last updated: {new Date(branch.lastUpdated).toLocaleDateString()}
              </div>
              <Link 
                to={`/branches/${branch.id}`}
                className="btn btn-primary btn-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No branches found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="page-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-label">Total Branches:</span>
            <span className="summary-value">{filteredBranches.length}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Active:</span>
            <span className="summary-value">
              {filteredBranches.filter(b => b.status === 'Active').length}
            </span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Under Maintenance:</span>
            <span className="summary-value">
              {filteredBranches.filter(b => b.status === 'Maintenance').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchList;