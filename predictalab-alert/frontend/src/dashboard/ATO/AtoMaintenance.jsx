import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FiEdit3, FiTrash2, FiEye } from "react-icons/fi";
import axios from "axios";

const COLORS = ["#36e80aff", "#F4B400", "#DB4437"];

export default function AtoMaintenancePage() {
  const [stats, setStats] = useState({
    totalMachines: 0,
    healthy: 0,
    alert: 0,
    critical: 0
  });
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'All',
    dateRange: 'All',
    severity: 'All'
  });

  // Fetch machine statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/maintenance/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching maintenance stats:', err);
        setError('Failed to load machine statistics');
      }
    };

    fetchStats();
  }, []);

  // Fetch maintenance logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/maintenance/logs/detailed');
        if (response.data.success) {
          setMaintenanceLogs(response.data.data);
          setFilteredLogs(response.data.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching maintenance logs:', err);
        setError('Failed to load maintenance logs');
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Apply filters whenever filter state or logs change
  useEffect(() => {
    let filtered = [...maintenanceLogs];

    // Filter by status
    if (filters.status !== 'All') {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    // Filter by severity
    if (filters.severity !== 'All') {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    // Filter by date range
    if (filters.dateRange !== 'All') {
      const now = new Date();
      filtered = filtered.filter(log => {
        const reportDate = new Date(log.reportDate);
        const daysDiff = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'Last 7 days':
            return daysDiff <= 7;
          case 'Last 30 days':
            return daysDiff <= 30;
          case 'Last 90 days':
            return daysDiff <= 90;
          case 'Over 90 days':
            return daysDiff > 90;
          default:
            return true;
        }
      });
    }

    setFilteredLogs(filtered);
  }, [filters, maintenanceLogs]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'All',
      dateRange: 'All',
      severity: 'All'
    });
  };

  // Prepare chart data from stats
  const chartData = [
    { name: "Healthy", value: stats.healthy },
    { name: "Alert", value: stats.alert },
    { name: "Critical", value: stats.critical },
  ];

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">Maintenance</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Machines", value: stats.totalMachines },
          { label: "Healthy", value: stats.healthy },
          { label: "Alert Machines", value: stats.alert },
          { label: "Critical Machines", value: stats.critical },
        ].map((item, i) => (
          <div
            key={i}
            className="border rounded-xl shadow-sm p-4 flex flex-col items-center bg-white"
          >
            <p className="text-3xl font-semibold">{item.value}</p>
            <p className="text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Machine Stats - Centered Donut Chart */}
      <div className="bg-white w-full border rounded-xl shadow-sm p-6 mb-10">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-3">
            Overall Machine Stats
          </h2>
          <div className="w-64 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="mt-3 space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#36e80aff] inline-block rounded-full" />
              Healthy ({stats.healthy})
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#F4B400] inline-block rounded-full" />
              Alert ({stats.alert})
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#DB4437] inline-block rounded-full" />
              Critical ({stats.critical})
            </p>
          </div>
        </div>
      </div>

      {/* Maintenance Schedule Table */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Scheduled Maintenance</h2>
          <div className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {maintenanceLogs.length} records
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
                <option value="Reopened">Reopened</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Time</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="Over 90 days">Over 90 days</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading maintenance logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700">
                  <th className="py-3 px-4">Machine Name</th>
                  <th className="py-3 px-4">Worker Name</th>
                  <th className="py-3 px-4">Issue Reported</th>
                  <th className="py-3 px-4">Report Date</th>
                  <th className="py-3 px-4">Days Since Report</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      {maintenanceLogs.length === 0 
                        ? "No maintenance logs found" 
                        : "No logs match the selected filters"}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">{log.machineName}</td>
                      <td className="py-3 px-4">{log.workerName}</td>
                      <td className="py-3 px-4">{log.requestType || log.description}</td>
                      <td className="py-3 px-4">{formatDate(log.reportDate)}</td>
                      <td className="py-3 px-4">{log.daysSinceReport} days</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold
                            ${
                              log.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : log.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }
                          `}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 flex gap-3 text-lg">
                        <FiEye className="text-blue-600 cursor-pointer" />
                        <FiEdit3 className="text-green-600 cursor-pointer" />
                        <FiTrash2 className="text-red-600 cursor-pointer" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
