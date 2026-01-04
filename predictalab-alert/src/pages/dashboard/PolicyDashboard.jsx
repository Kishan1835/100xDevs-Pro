import React, { useState, useEffect } from 'react';
import StatCard from '../../components/cards/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import { fetchDashboardStats, fetchBranches, fetchChartData } from '../../services/api';

const PolicyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  useEffect(() => {
    const loadPolicyDashboardData = async () => {
      try {
        const [statsData, branchesData, machineHealthData, performanceData, complaintTrendData] = await Promise.all([
          fetchDashboardStats(),
          fetchBranches(),
          fetchChartData('machineHealthTrend'),
          fetchChartData('itiPerformance'),
          fetchChartData('complaintTrend')
        ]);

        setStats(statsData);
        setBranches(branchesData);
        setChartData({
          machineHealth: machineHealthData,
          performance: performanceData,
          complaintTrend: complaintTrendData
        });
      } catch (error) {
        console.error('Error loading policy dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPolicyDashboardData();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading policy dashboard...</p>
      </div>
    );
  }

  const calculateGrowthRate = (current, previous) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="dashboard policy-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>NCVET Policy Dashboard</h1>
          <p>National overview and policy insights</p>
        </div>
        <div className="header-actions">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-selector"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="btn btn-primary">Generate Report</button>
        </div>
      </div>

      {/* National Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total ITI Institutes"
          value={stats.totalBranches}
          icon="🏛️"
          color="blue"
          trend={calculateGrowthRate(stats.totalBranches, 23)}
          trendDirection="up"
        />
        <StatCard
          title="Total Students Enrolled"
          value={stats.totalStudents.toLocaleString()}
          icon="🎓"
          color="green"
          trend={calculateGrowthRate(stats.totalStudents, 2200)}
          trendDirection="up"
        />
        <StatCard
          title="Training Equipment"
          value={stats.totalMachines}
          icon="🏭"
          color="orange"
          trend={calculateGrowthRate(stats.totalMachines, 370)}
          trendDirection="up"
        />
        <StatCard
          title="Skilled Workforce"
          value={stats.totalTechnicians}
          icon="👨‍🏭"
          color="purple"
          trend={calculateGrowthRate(stats.totalTechnicians, 140)}
          trendDirection="up"
        />
        <StatCard
          title="System Efficiency"
          value="92.5%"
          icon="📈"
          color="indigo"
          trend={2.3}
          trendDirection="up"
        />
      </div>

      {/* Policy Metrics Grid */}
      <div className="dashboard-content policy-content">
        
        {/* National Performance Overview */}
        <div className="dashboard-card performance-overview">
          <div className="card-header">
            <h3>National ITI Performance Overview</h3>
            <div className="header-filters">
              <button className="btn btn-sm btn-outline">Export Data</button>
            </div>
          </div>
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">Average Performance Score</span>
              <span className="metric-value">8.5/10</span>
              <span className="metric-trend positive">+0.3</span>
            </div>
            <div className="metric">
              <span className="metric-label">Student Placement Rate</span>
              <span className="metric-value">78%</span>
              <span className="metric-trend positive">+5%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Equipment Utilization</span>
              <span className="metric-value">85%</span>
              <span className="metric-trend negative">-2%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Quality Index</span>
              <span className="metric-value">9.1/10</span>
              <span className="metric-trend positive">+0.1</span>
            </div>
          </div>
        </div>

        {/* Regional Performance Chart */}
        <div className="dashboard-card chart-card">
          <BarChart 
            data={chartData.performance || []}
            title="Regional ITI Performance Comparison"
            height={300}
          />
        </div>

        {/* Complaint Trends */}
        <div className="dashboard-card chart-card">
          <LineChart 
            data={chartData.complaintTrend || []}
            title="National Complaint Resolution Trends"
            height={300}
          />
        </div>

        {/* Top Performing ITIs */}
        <div className="dashboard-card top-performers">
          <div className="card-header">
            <h3>Top Performing ITIs</h3>
          </div>
          <div className="performers-list">
            {branches.slice(0, 5).map((branch, index) => (
              <div key={branch.id} className="performer-item">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <h4 className="performer-name">{branch.name}</h4>
                  <p className="performer-location">{branch.address}</p>
                </div>
                <div className="performer-metrics">
                  <span className="metric">
                    <strong>{branch.students}</strong> Students
                  </span>
                  <span className="metric">
                    <strong>{Math.round((branch.workingMachines / branch.totalMachines) * 100)}%</strong> Efficiency
                  </span>
                </div>
                <div className="performer-score">
                  <span className="score-value">8.{9 - index}</span>
                  <span className="score-label">/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Recommendations */}
        <div className="dashboard-card recommendations">
          <div className="card-header">
            <h3>Policy Recommendations</h3>
          </div>
          <div className="recommendations-list">
            <div className="recommendation-item priority-high">
              <div className="recommendation-icon">🎯</div>
              <div className="recommendation-content">
                <h4>Increase Equipment Investment</h4>
                <p>15 ITIs require urgent equipment upgrades to meet industry standards.</p>
                <span className="priority-label">High Priority</span>
              </div>
            </div>
            <div className="recommendation-item priority-medium">
              <div className="recommendation-icon">📚</div>
              <div className="recommendation-content">
                <h4>Enhance Training Programs</h4>
                <p>Standardize curriculum across regions to improve consistency.</p>
                <span className="priority-label">Medium Priority</span>
              </div>
            </div>
            <div className="recommendation-item priority-low">
              <div className="recommendation-icon">🤝</div>
              <div className="recommendation-content">
                <h4>Industry Partnership</h4>
                <p>Strengthen partnerships with local industries for better placement rates.</p>
                <span className="priority-label">Low Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Allocation */}
        <div className="dashboard-card budget-allocation">
          <div className="card-header">
            <h3>Budget Allocation Overview</h3>
          </div>
          <div className="budget-breakdown">
            <div className="budget-item">
              <span className="budget-category">Equipment & Infrastructure</span>
              <div className="budget-bar">
                <div className="budget-progress" style={{ width: '45%' }}></div>
              </div>
              <span className="budget-amount">₹45 Cr (45%)</span>
            </div>
            <div className="budget-item">
              <span className="budget-category">Staff Training & Development</span>
              <div className="budget-bar">
                <div className="budget-progress" style={{ width: '25%' }}></div>
              </div>
              <span className="budget-amount">₹25 Cr (25%)</span>
            </div>
            <div className="budget-item">
              <span className="budget-category">Student Scholarships</span>
              <div className="budget-bar">
                <div className="budget-progress" style={{ width: '20%' }}></div>
              </div>
              <span className="budget-amount">₹20 Cr (20%)</span>
            </div>
            <div className="budget-item">
              <span className="budget-category">Operations & Maintenance</span>
              <div className="budget-bar">
                <div className="budget-progress" style={{ width: '10%' }}></div>
              </div>
              <span className="budget-amount">₹10 Cr (10%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDashboard;