import React, { useState, useEffect } from 'react';
import { fetchMachines } from '../../services/api';
import MachineCard from '../../components/cards/MachineCard';
import StatCard from '../../components/cards/StatCard';

const MachineList = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadMachines = async () => {
      try {
        const machinesData = await fetchMachines();
        setMachines(machinesData);
      } catch (error) {
        console.error('Error loading machines:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMachines();
  }, []);

  const handleMachineDetails = (machine) => {
    console.log('View machine details:', machine);
    // Implement machine details modal or navigation
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || machine.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesBranch = filterBranch === 'all' || machine.branchName === filterBranch;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const stats = {
    total: machines.length,
    working: machines.filter(m => m.status === 'Working').length,
    maintenance: machines.filter(m => m.status === 'Under Maintenance').length,
    faulty: machines.filter(m => m.status === 'Faulty').length,
    avgEfficiency: Math.round(machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length)
  };

  const uniqueBranches = [...new Set(machines.map(m => m.branchName))];

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading machines...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Machine Management</h1>
          <p>Monitor and manage all machines across ITI branches</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Export Inventory</button>
          <button className="btn btn-primary">Add Machine</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Machines"
          value={stats.total}
          icon="⚙️"
          color="blue"
        />
        <StatCard
          title="Working"
          value={stats.working}
          icon="✅"
          color="green"
          trend={Math.round((stats.working / stats.total) * 100)}
          trendDirection="up"
        />
        <StatCard
          title="Under Maintenance"
          value={stats.maintenance}
          icon="🔧"
          color="orange"
        />
        <StatCard
          title="Average Efficiency"
          value={`${stats.avgEfficiency}%`}
          icon="📊"
          color="purple"
          trend={2.5}
          trendDirection="up"
        />
      </div>

      {/* Filters and Search */}
      <div className="page-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search machines by name, type, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="working">Working</option>
              <option value="under maintenance">Under Maintenance</option>
              <option value="faulty">Faulty</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Branch:</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Branches</option>
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-outline">
            Schedule Bulk Maintenance
          </button>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="machines-section">
        <div className="section-header">
          <h3>Machine Inventory ({filteredMachines.length})</h3>
          <div className="view-controls">
            <button className="view-btn active">Grid View</button>
            <button className="view-btn">List View</button>
          </div>
        </div>

        <div className="machines-grid">
          {filteredMachines.map(machine => (
            <MachineCard 
              key={machine.id}
              machine={machine}
              onViewDetails={handleMachineDetails}
            />
          ))}
        </div>

        {filteredMachines.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">⚙️</div>
            <h3>No machines found</h3>
            <p>Try adjusting your search criteria or filters.</p>
            <button className="btn btn-primary">Add New Machine</button>
          </div>
        )}
      </div>

      {/* Machine Statistics Summary */}
      <div className="dashboard-card summary-stats">
        <div className="card-header">
          <h3>Machine Statistics Summary</h3>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-icon">🏭</div>
            <div className="summary-content">
              <h4>Machine Types</h4>
              <div className="type-breakdown">
                <div className="type-item">
                  <span>CNC Machines:</span>
                  <span>{machines.filter(m => m.type.includes('CNC')).length}</span>
                </div>
                <div className="type-item">
                  <span>Welding Equipment:</span>
                  <span>{machines.filter(m => m.type.includes('Welding')).length}</span>
                </div>
                <div className="type-item">
                  <span>Other Equipment:</span>
                  <span>{machines.filter(m => !m.type.includes('CNC') && !m.type.includes('Welding')).length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <h4>Maintenance Schedule</h4>
              <div className="maintenance-breakdown">
                <div className="maintenance-item">
                  <span>Due This Week:</span>
                  <span className="urgent">3 machines</span>
                </div>
                <div className="maintenance-item">
                  <span>Due Next Week:</span>
                  <span>7 machines</span>
                </div>
                <div className="maintenance-item">
                  <span>Overdue:</span>
                  <span className="overdue">2 machines</span>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h4>Efficiency Metrics</h4>
              <div className="efficiency-breakdown">
                <div className="efficiency-range">
                  <span>90%+ Efficiency:</span>
                  <span>{machines.filter(m => m.efficiency >= 90).length} machines</span>
                </div>
                <div className="efficiency-range">
                  <span>70-89% Efficiency:</span>
                  <span>{machines.filter(m => m.efficiency >= 70 && m.efficiency < 90).length} machines</span>
                </div>
                <div className="efficiency-range">
                  <span>Below 70%:</span>
                  <span className="low-efficiency">{machines.filter(m => m.efficiency < 70).length} machines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineList;