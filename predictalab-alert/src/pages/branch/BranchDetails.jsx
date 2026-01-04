import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBranchById, fetchMachines, fetchChartData } from '../../services/api';
import StatCard from '../../components/cards/StatCard';
import LineChart from '../../components/charts/LineChart';
import MachineCard from '../../components/cards/MachineCard';

const BranchDetails = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [machines, setMachines] = useState([]);
  const [chartData, setChartData] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranchData = async () => {
      try {
        const [branchData, machinesData, machineHealthData, complaintTrendData] = await Promise.all([
          fetchBranchById(id),
          fetchMachines(id),
          fetchChartData('machineHealthTrend'),
          fetchChartData('complaintTrend')
        ]);

        setBranch(branchData);
        setMachines(machinesData);
        setChartData({
          machineHealth: machineHealthData,
          complaintTrend: complaintTrendData
        });
      } catch (error) {
        console.error('Error loading branch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBranchData();
    }
  }, [id]);

  const handleMachineDetails = (machine) => {
    console.log('View machine details:', machine);
    // Implement machine details modal or navigation
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading branch details...</p>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="page-error">
        <h2>Branch not found</h2>
        <p>The requested branch could not be found.</p>
      </div>
    );
  }

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'complaints', label: 'Complaints', icon: '📝' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'machines', label: 'Machines', icon: '⚙️' },
    { id: 'workforce', label: 'Workforce', icon: '👥' },
    { id: 'scheduling', label: 'Scheduling', icon: '📅' }
  ];

  return (
    <div className="page-container">
      {/* Branch Header */}
      <div className="page-header branch-header">
        <div className="header-content">
          <div className="branch-title">
            <h1>Branch Details – {branch.name}</h1>
            <p className="branch-location">{branch.address}</p>
          </div>
          <div className={`branch-status-badge ${getStatusColor(branch.status)}`}>
            {branch.status}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Export Report</button>
          <button className="btn btn-primary">Edit Branch</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Machines"
          value={branch.totalMachines}
          icon="⚙️"
          color="blue"
        />
        <StatCard
          title="Working Machines"
          value={branch.workingMachines}
          icon="✅"
          color="green"
          trend={Math.round((branch.workingMachines / branch.totalMachines) * 100)}
          trendDirection="up"
        />
        <StatCard
          title="Total Students"
          value={branch.students}
          icon="👥"
          color="orange"
          trend={8.5}
          trendDirection="up"
        />
        <StatCard
          title="Workforce"
          value={branch.workforce}
          icon="👨‍🏫"
          color="purple"
        />
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <nav className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="tab-panel overview-panel">
            <div className="overview-grid">
              {/* Charts */}
              <div className="chart-section">
                <div className="dashboard-card chart-card">
                  <LineChart 
                    data={chartData.machineHealth || []}
                    title="Machine Health Trend"
                    height={250}
                  />
                </div>
                
                <div className="dashboard-card chart-card">
                  <LineChart 
                    data={chartData.complaintTrend || []}
                    title="Complaint Trend"
                    height={250}
                  />
                </div>
              </div>

              {/* Recent Activities */}
              <div className="dashboard-card activities-card">
                <div className="card-header">
                  <h3>Recent Activities</h3>
                </div>
                <div className="activities-list">
                  <div className="activity-item">
                    <div className="activity-icon">🔧</div>
                    <div className="activity-content">
                      <p>CNC Machine maintenance completed</p>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">👥</div>
                    <div className="activity-content">
                      <p>5 new students enrolled</p>
                      <span className="activity-time">1 day ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-content">
                      <p>Complaint resolved for welding station</p>
                      <span className="activity-time">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'machines' && (
          <div className="tab-panel machines-panel">
            <div className="panel-header">
              <h3>Machine Inventory</h3>
              <div className="panel-actions">
                <button className="btn btn-outline">Add Machine</button>
                <button className="btn btn-primary">Schedule Maintenance</button>
              </div>
            </div>
            <div className="machines-grid">
              {machines.map(machine => (
                <MachineCard 
                  key={machine.id}
                  machine={machine}
                  onViewDetails={handleMachineDetails}
                />
              ))}
            </div>
            {machines.length === 0 && (
              <div className="no-data">
                <div className="no-data-icon">⚙️</div>
                <h4>No machines found</h4>
                <p>No machines are currently registered for this branch.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="tab-panel complaints-panel">
            <div className="panel-header">
              <h3>Complaint Management</h3>
              <button className="btn btn-primary">New Complaint</button>
            </div>
            <div className="complaints-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Issue Type</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Date Raised</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#001</td>
                    <td>Machine Issue</td>
                    <td>CNC Machine not calibrating properly</td>
                    <td><span className="severity-badge severity-high">High</span></td>
                    <td><span className="status-badge status-in-progress">In Progress</span></td>
                    <td>2024-11-25</td>
                    <td>
                      <button className="btn btn-sm btn-outline">View</button>
                    </td>
                  </tr>
                  <tr>
                    <td>#002</td>
                    <td>Infrastructure</td>
                    <td>Electrical power fluctuation</td>
                    <td><span className="severity-badge severity-medium">Medium</span></td>
                    <td><span className="status-badge status-raised">Raised</span></td>
                    <td>2024-11-24</td>
                    <td>
                      <button className="btn btn-sm btn-outline">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="tab-panel maintenance-panel">
            <div className="panel-header">
              <h3>Maintenance Schedule</h3>
              <button className="btn btn-primary">Schedule Maintenance</button>
            </div>
            <div className="maintenance-calendar">
              <div className="calendar-placeholder">
                <div className="calendar-header">
                  <h4>November 2024</h4>
                </div>
                <div className="calendar-grid">
                  <div className="calendar-day">
                    <span className="day-number">26</span>
                    <div className="day-events">
                      <div className="event maintenance">CNC Maintenance</div>
                    </div>
                  </div>
                  <div className="calendar-day">
                    <span className="day-number">27</span>
                    <div className="day-events">
                      <div className="event inspection">Weekly Inspection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workforce' && (
          <div className="tab-panel workforce-panel">
            <div className="panel-header">
              <h3>Workforce Management</h3>
              <button className="btn btn-primary">Add Staff</button>
            </div>
            <div className="workforce-grid">
              <div className="staff-card">
                <div className="staff-avatar">
                  <img src="/api/placeholder/50/50" alt="Staff" />
                </div>
                <div className="staff-info">
                  <h4>Rajesh Kumar</h4>
                  <p>Senior Instructor</p>
                  <div className="staff-skills">
                    <span className="skill-tag">CNC Operations</span>
                    <span className="skill-tag">Welding</span>
                  </div>
                </div>
              </div>
              
              <div className="staff-card">
                <div className="staff-avatar">
                  <img src="/api/placeholder/50/50" alt="Staff" />
                </div>
                <div className="staff-info">
                  <h4>Priya Sharma</h4>
                  <p>Training Officer</p>
                  <div className="staff-skills">
                    <span className="skill-tag">Electronics</span>
                    <span className="skill-tag">Automation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scheduling' && (
          <div className="tab-panel scheduling-panel">
            <div className="panel-header">
              <h3>Class & Training Schedules</h3>
              <button className="btn btn-primary">Create Schedule</button>
            </div>
            <div className="schedule-view">
              <div className="schedule-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Monday</th>
                      <th>Tuesday</th>
                      <th>Wednesday</th>
                      <th>Thursday</th>
                      <th>Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>9:00 AM</td>
                      <td>CNC Operations</td>
                      <td>Welding Basics</td>
                      <td>CNC Operations</td>
                      <td>Electronics</td>
                      <td>Project Work</td>
                    </tr>
                    <tr>
                      <td>11:00 AM</td>
                      <td>Theory Class</td>
                      <td>Practical</td>
                      <td>Theory Class</td>
                      <td>Practical</td>
                      <td>Assessment</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchDetails;