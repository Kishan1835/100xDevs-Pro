// src/dashboard/Maintenance/MaintenanceDashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";
import { calcDaysSince, formatDate } from "../../utils/dateUtils";

const API_BASE_URL = "http://localhost:5000/api";

export default function MaintenanceDashboard() {
  // State for stats
  const [stats, setStats] = useState({
    healthyMachines: 0,
    alertMachines: 0,
    criticalMachines: 0,
    pendingLogs: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // State for logs
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    startDate: "",
    endDate: "",
    limit: 10,
    offset: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/maintenance/dashboard/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching maintenance stats:", err);
      setStats({
        healthyMachines: 0,
        alertMachines: 0,
        criticalMachines: 0,
        pendingLogs: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams();

      if (filters.status !== "All") params.append("status", filters.status);
      if (filters.priority !== "All") params.append("priority", filters.priority);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      params.append("limit", filters.limit);
      params.append("offset", filters.offset);

      const response = await axios.get(
        `${API_BASE_URL}/maintenance/dashboard/logs?${params.toString()}`
      );

      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching maintenance logs:", err);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset to first page
    }));
    setCurrentPage(1);
  };

  // Handle pagination
  const handleNextPage = () => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (filters.offset === 0) return;
    setFilters((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  // Refresh both stats and logs
  const handleRefresh = () => {
    fetchStats();
    fetchLogs();
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Open":
      case "In Progress":
      case "Reopened":
        return "bg-blue-100 text-blue-700";
      case "Closed":
      case "Completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Get priority badge color
  const getPriorityBadgeClass = (priority) => {
    if (!priority) return "bg-slate-100 text-slate-700";
    switch (priority.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-orange-100 text-orange-700";
      case "low":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Check if a log is overdue (>3 days and not closed)
  const isOverdue = (log) => {
    return (
      log.daysSinceReport > 3 &&
      log.status !== "Closed" &&
      log.status !== "Completed"
    );
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1280px] mx-auto p-8">
        {/* PAGE TITLE */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Maintenance Dashboard</h1>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <FiRefreshCw className={statsLoading || logsLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="mt-8 grid grid-cols-4 gap-6">
          <div className="p-6 rounded-lg border bg-white shadow-sm">
            <div className="text-3xl font-bold bg-green-100 text-green-700">
              {statsLoading ? "..." : stats.healthyMachines}
            </div>
            <div className="text-sm text-slate-500 mt-2">Healthy Machines</div>
          </div>

          <div className="p-6 rounded-lg border bg-white shadow-sm">
            <div className="text-3xl font-bold bg-yellow-100 text-yellow-700">
              {statsLoading ? "..." : stats.alertMachines}
            </div>
            <div className="text-sm text-slate-500 mt-2">Alert Machines</div>
          </div>

          <div className="p-6 rounded-lg border bg-white shadow-sm">
            <div className="text-3xl font-bold bg-red-100 text-red-700">
              {statsLoading ? "..." : stats.criticalMachines}
            </div>
            <div className="text-sm text-slate-500 mt-2">Critical Machines</div>
          </div>

          <div className="p-6 rounded-lg border bg-white shadow-sm">
            <div className="text-3xl font-bold bg-blue-100 text-blue-700">
              {statsLoading ? "..." : stats.pendingLogs}
            </div>
            <div className="text-sm text-slate-500 mt-2">Pending Maintenance</div>
          </div>
        </div>

        {/* WORK ORDERS HEADER */}
        <h2 className="text-2xl font-bold mt-10">Work Orders</h2>

        {/* FILTERS */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 font-medium">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-blue-500 text-sm"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 font-medium">Priority:</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-blue-500 text-sm"
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 font-medium">From:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-blue-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 font-medium">To:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-blue-500 text-sm"
            />
          </div>

          {/* Rows per page */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-slate-600 font-medium">Rows:</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md focus:outline-blue-500 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* WORK ORDERS TABLE */}
        <div className="mt-6 border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr className="text-sm text-slate-500">
                <th className="p-3">Work Order ID</th>
                <th className="p-3">Machine</th>
                <th className="p-3">Issue</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Reported</th>
                <th className="p-3">Days Since</th>
              </tr>
            </thead>

            <tbody>
              {logsLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading work orders...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No work orders found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.mlId}
                    className={`border-b hover:bg-slate-50 transition text-sm ${
                      isOverdue(log) ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="p-3 font-medium">WO-{String(log.mlId).padStart(4, "0")}</td>

                    <td className="p-3">
                      <div className="font-medium">{log.machineName}</div>
                      {log.machineCode && (
                        <div className="text-xs text-slate-400">#{log.machineCode}</div>
                      )}
                    </td>

                    <td className="p-3">{log.issueReported}</td>

                    {/* PRIORITY BADGE */}
                    <td className="p-3">
                      {log.priority ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(
                            log.priority
                          )}`}
                        >
                          {log.priority}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* STATUS BADGE */}
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td className="p-3">{log.workerName || "Unassigned"}</td>

                    <td className="p-3 text-xs text-slate-500">
                      {formatDate(log.reportDate)}
                    </td>

                    <td
                      className={`p-3 font-medium ${
                        isOverdue(log) ? "text-red-700" : "text-slate-700"
                      }`}
                    >
                      {log.daysSinceReport} {log.daysSinceReport === 1 ? "day" : "days"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-600">
            Page {currentPage} • Showing {logs.length} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={filters.offset === 0}
              className={`px-4 py-2 border rounded-md text-sm ${
                filters.offset === 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNextPage}
              disabled={logs.length < filters.limit}
              className={`px-4 py-2 border rounded-md text-sm ${
                logs.length < filters.limit
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
