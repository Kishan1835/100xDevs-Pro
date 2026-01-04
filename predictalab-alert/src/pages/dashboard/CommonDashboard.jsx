import React, { useState, useEffect } from 'react';
import StatCard from '../../components/cards/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import { fetchDashboardStats, fetchRecentActivities, fetchChartData, fetchComplaints } from '../../services/api';

const CommonDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, activitiesData, complaintsData, machineHealthData, performanceData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivities(),
          fetchComplaints(),
          fetchChartData('machineHealthTrend'),
          fetchChartData('itiPerformance')
        ]);

        setStats(statsData);
        setRecentActivities(activitiesData);
        setComplaints(complaintsData);
        setChartData({
          machineHealth: machineHealthData,
          performance: performanceData
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p></p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Branches"
          value={stats.totalBranches}
          icon="🏢"
          color="blue"
          trend={5.2}
          trendDirection="up"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          icon="👥"
          color="green"
          trend={8.1}
          trendDirection="up"
        />
        <StatCard
          title="Total Machines"
          value={stats.totalMachines}
          icon="⚙️"
          color="orange"
          trend={2.3}
          trendDirection="down"
        />
        <StatCard
          title="Active Complaints"
          value={stats.totalComplaints}
          icon="📝"
          color="red"
          trend={12.5}
          trendDirection="down"
        />
        <StatCard
          title="Technicians"
          value={stats.totalTechnicians}
          icon="👨‍🔧"
          color="purple"
          trend={3.7}
          trendDirection="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Map Section */}
        <div className="dashboard-card map-card">
          <div className="card-header">
            <h3>ITI Locations</h3>
            <button className="btn btn-outline btn-sm">View Full Map</button>
          </div>
          <div className="map-container">
            <div className="map-placeholder">
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.1%2C28.4%2C77.3%2C28.7&layer=mapnik"
                title="ITI Locations Map"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="dashboard-card complaints-card">
          <div className="card-header">
            <h3>Recent Complaints</h3>
            <button className="btn btn-outline btn-sm">View All</button>
          </div>
          <div className="complaints-table">
            <table>
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 5).map(complaint => (
                  <tr key={complaint.id}>
                    <td>{complaint.branchName}</td>
                    <td>{complaint.description}</td>
                    <td>
                      <span className={`severity-badge severity-${complaint.severity.toLowerCase()}`}>
                        {complaint.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>{complaint.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-card chart-card">
          <LineChart 
            data={chartData.machineHealth || []}
            title="Machine Health Trend"
            height={250}
          />
        </div>

        <div className="dashboard-card chart-card">
          <BarChart 
            data={chartData.performance || []}
            title="ITI Performance Scores"
            height={250}
          />
        </div>

        {/* Recent Activities */}
        <div className="dashboard-card activities-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
          </div>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'Machine Maintenance' && '🔧'}
                  {activity.type === 'New Complaint' && '📝'}
                  {activity.type === 'Student Enrollment' && '👥'}
                </div>
                <div className="activity-content">
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-meta">
                    <span className="activity-branch">{activity.branchName}</span>
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonDashboard;