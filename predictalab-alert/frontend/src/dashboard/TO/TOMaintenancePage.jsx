import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDate, daysSinceDate } from "../../utils/dateUtils";
import { FiPhone, FiX } from "react-icons/fi";

export default function TOMaintenancePage() {
  const [stats, setStats] = useState({
    activeMachines: 0,
    underMaintenance: 0,
    upcomingMaintenance: 0,
  });
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    machine: 'all',
    limit: 5,
    startDate: '',
    endDate: '',
  });

  // Fetch stats and logs on component mount
  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters, allLogs]);

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats and all logs in parallel
      const [statsResponse, logsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/maintenance/to-stats"),
        axios.get("http://localhost:5000/api/maintenance/logs/detailed"),
      ]);

      setStats(statsResponse.data.data);
      setAllLogs(logsResponse.data.data);
    } catch (err) {
      console.error("Error fetching maintenance data:", err);
      setError("Failed to load maintenance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allLogs];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => 
        log.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Filter by machine
    if (filters.machine !== 'all') {
      filtered = filtered.filter(log => 
        log.machineName?.toLowerCase().includes(filters.machine.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(log => 
        new Date(log.reportDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(log => 
        new Date(log.reportDate) <= new Date(filters.endDate)
      );
    }

    // Apply limit
    const limited = filtered.slice(0, parseInt(filters.limit));
    setLogs(limited);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      machine: 'all',
      limit: 5,
      startDate: '',
      endDate: '',
    });
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600";
      case "completed":
      case "closed":
        return "text-green-600";
      case "in progress":
      case "open":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Check if row should be highlighted (overdue)
  const isOverdue = (reportDate, status) => {
    const days = daysSinceDate(reportDate);
    return days > 2 && status?.toLowerCase() === "pending";
  };

  // Show worker contact popup
  const handleCallClick = (worker) => {
    setSelectedWorker(worker);
  };

  // Close worker contact popup
  const closePopup = () => {
    setSelectedWorker(null);
  };

  // Reopen a closed maintenance case
  const handleReopenCase = async () => {
    if (!selectedWorker || !selectedWorker.logId) return;

    try {
      await axios.put(`http://localhost:5000/api/maintenance/reopen/${selectedWorker.logId}`);
      
      // Show success message
      alert('Case reopened successfully!');
      
      // Close popup
      closePopup();
      
      // Refresh the data
      fetchMaintenanceData();
    } catch (err) {
      console.error('Error reopening case:', err);
      alert('Failed to reopen case. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchMaintenanceData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6">
      {/* ---------------- Header Title ---------------- */}
      <h1 className="text-3xl font-semibold mb-6">Maintenance Dashboard</h1>

      {/* ---------------- Stats Cards ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-3xl font-semibold text-green-600">{stats.activeMachines}</p>
          <p className="text-gray-600 text-sm mt-1">Active Machines</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-3xl font-semibold text-blue-600">{stats.underMaintenance}</p>
          <p className="text-gray-600 text-sm mt-1">Under Maintenance</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-3xl font-semibold text-yellow-600">{stats.upcomingMaintenance}</p>
          <p className="text-gray-600 text-sm mt-1">Upcoming Maintenance</p>
        </div>
      </div>

      {/* ---------------- Filter Bar ---------------- */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          {/* Machine Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Machine
            </label>
            <input
              type="text"
              value={filters.machine}
              onChange={(e) => handleFilterChange('machine', e.target.value)}
              placeholder="Search machine..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Records
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5">5 Records</option>
              <option value="10">10 Records</option>
              <option value="20">20 Records</option>
              <option value="50">50 Records</option>
              <option value="100">100 Records</option>
              <option value="999999">All Records</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {logs.length} of {allLogs.length} total complaints
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ---------------- Section Title ---------------- */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Recent Maintenance Requests</h2>
        <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
          View All
        </button>
      </div>

      {/* ---------------- Recent Requests Table ---------------- */}
      <div className="bg-white shadow rounded-xl overflow-hidden mb-10">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No maintenance requests found.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Request Type</th>
                <th className="py-3 px-4">Date Requested</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Contact</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => {
                const overdue = isOverdue(log.reportDate, log.status);
                return (
                  <tr
                    key={log.logId}
                    className={`border-t ${overdue ? "bg-red-50" : ""}`}
                  >
                    <td className="py-3 px-4 font-medium">{log.machineName}</td>
                    <td className="py-3 px-4">{log.requestType || log.description}</td>
                    <td className="py-3 px-4">
                      {formatDate(log.reportDate, false)}
                      <span className="text-xs text-gray-500 ml-2">
                        ({log.daysSinceReport} {log.daysSinceReport === 1 ? 'day' : 'days'} ago)
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        overdue ? "text-red-600" : getStatusColor(log.status)
                      }`}
                    >
                      {log.status}
                      {overdue && <span className="ml-1 text-xs">(Overdue)</span>}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          handleCallClick({
                            name: log.workerName,
                            contact: log.workerContact,
                            logId: log.logId,
                            status: log.status,
                          })
                        }
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        title="Call Maintenance Worker"
                      >
                        <FiPhone size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ---------------- Worker Contact Popup ---------------- */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 relative">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">Maintenance Worker Contact</h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Worker Name</p>
                <p className="font-medium text-lg">{selectedWorker.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium text-lg flex items-center gap-2">
                  <FiPhone size={18} className="text-blue-600" />
                  {selectedWorker.contact}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleReopenCase}
                disabled={selectedWorker.status?.toLowerCase() !== 'closed'}
                className={`flex-1 px-4 py-2 rounded-lg text-center transition-colors ${
                  selectedWorker.status?.toLowerCase() === 'closed'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                }`}
              >
                Reopen Case
              </button>
              <button
                onClick={closePopup}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Maintenance Details Cards ---------------- */}
      <h2 className="text-lg font-semibold mb-3">Request Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {logs.slice(0, 2).map((log) => (
          <div key={log.logId} className="bg-white shadow rounded-xl p-6 space-y-3">
            <div>
              <p className="text-gray-500 text-sm">Machine</p>
              <p className="font-medium">{log.machineName}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Worker Assigned</p>
              <p className="font-medium">{log.workerName}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Date Requested</p>
              <p className="font-medium">{formatDate(log.reportDate, false)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {log.daysSinceReport} {log.daysSinceReport === 1 ? 'day' : 'days'} ago
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Description</p>
              <p className="font-medium">{log.description || log.requestType}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <p className={`font-medium ${getStatusColor(log.status)}`}>{log.status}</p>
            </div>

            <button
              onClick={() =>
                handleCallClick({
                  name: log.workerName,
                  contact: log.workerContact,
                  logId: log.logId,
                  status: log.status,
                })
              }
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPhone size={16} />
              Contact Worker
            </button>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No detailed requests to display.
          </div>
        )}
      </div>
    </div>
  );
}
