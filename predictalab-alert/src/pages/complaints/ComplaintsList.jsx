import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchComplaints } from '../../services/api';
import StatCard from '../../components/cards/StatCard';

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const complaintsData = await fetchComplaints();
        setComplaints(complaintsData);
      } catch (error) {
        console.error('Error loading complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'raised':
        return 'status-warning';
      case 'in progress':
        return 'status-info';
      case 'solved':
        return 'status-success';
      default:
        return 'status-default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-default';
    }
  };

  const filteredComplaints = complaints
    .filter(complaint => {
      const matchesStatus = filterStatus === 'all' || complaint.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesSeverity = filterSeverity === 'all' || complaint.severity.toLowerCase() === filterSeverity.toLowerCase();
      return matchesStatus && matchesSeverity;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'lastUpdated') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const stats = {
    totalRaised: complaints.reduce((sum, complaint) => sum + complaint.issueRaised, 0),
    totalInProgress: complaints.reduce((sum, complaint) => sum + complaint.inProgress, 0),
    totalSolved: complaints.reduce((sum, complaint) => sum + complaint.solved, 0),
    avgScore: (complaints.reduce((sum, complaint) => sum + complaint.itiScore, 0) / complaints.length).toFixed(1)
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Complaint Management</h1>
          <p>Track and manage all complaints across ITI branches</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Export Report</button>
          <button className="btn btn-primary">New Complaint</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Raised"
          value={stats.totalRaised}
          icon="📝"
          color="orange"
        />
        <StatCard
          title="In Progress"
          value={stats.totalInProgress}
          icon="🔄"
          color="blue"
        />
        <StatCard
          title="Solved"
          value={stats.totalSolved}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Average ITI Score"
          value={stats.avgScore}
          icon="📊"
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="page-filters">
        <div className="filter-section">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="raised">Raised</option>
              <option value="in progress">In Progress</option>
              <option value="solved">Solved</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Severity:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Severity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="lastUpdated">Last Updated</option>
              <option value="itiScore">ITI Score</option>
              <option value="severity">Severity</option>
              <option value="branchName">Branch Name</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Complaints Overview</h3>
          <div className="table-actions">
            <button className="btn btn-sm btn-outline">Bulk Actions</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Branch Name</th>
                <th>Issue Raised</th>
                <th>In Progress</th>
                <th>Solved</th>
                <th>Severity</th>
                <th>ITI Score</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(complaint => (
                <tr key={complaint.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td className="branch-name">
                    <Link to={`/branches/${complaint.branchId}`}>
                      {complaint.branchName}
                    </Link>
                  </td>
                  <td>
                    <span className="count-badge">{complaint.issueRaised}</span>
                  </td>
                  <td>
                    <span className="count-badge">{complaint.inProgress}</span>
                  </td>
                  <td>
                    <span className="count-badge">{complaint.solved}</span>
                  </td>
                  <td>
                    <span className={`severity-badge ${getSeverityColor(complaint.severity)}`}>
                      {complaint.severity}
                    </span>
                  </td>
                  <td>
                    <div className="score-display">
                      <span className="score-value">{complaint.itiScore}</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ width: `${(complaint.itiScore / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="date-column">
                    {new Date(complaint.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="actions-column">
                    <div className="action-buttons">
                      <Link 
                        to={`/complaints/${complaint.id}`}
                        className="btn btn-sm btn-outline"
                      >
                        View
                      </Link>
                      <button className="btn btn-sm btn-primary">
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredComplaints.length === 0 && (
          <div className="no-data">
            <div className="no-data-icon">📝</div>
            <h3>No complaints found</h3>
            <p>No complaints match the current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>
        <div className="pagination-controls">
          <button className="btn btn-outline btn-sm" disabled>Previous</button>
          <span className="pagination-pages">
            <button className="btn btn-sm active">1</button>
            <button className="btn btn-sm">2</button>
            <button className="btn btn-sm">3</button>
          </span>
          <button className="btn btn-outline btn-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsList;