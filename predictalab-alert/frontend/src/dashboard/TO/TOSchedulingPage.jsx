import React, { useState, useEffect } from "react";
import { formatDate, formatTime } from "../../utils/dateFormatter";

const API_BASE_URL = "http://localhost:5000/api";

export default function TOSchedulingPage() {
  // State management
  const [scheduleLogs, setScheduleLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filterType, setFilterType] = useState("all"); // "all", "single", "range"
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch schedule logs from backend
  const fetchScheduleLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${API_BASE_URL}/schedule-logs`;
      const params = new URLSearchParams();

      // Add date filters based on filter type
      if (filterType === "single" && selectedDate) {
        params.append("date", selectedDate);
      } else if (filterType === "range" && startDate && endDate) {
        params.append("start", startDate);
        params.append("end", endDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Sort data by logId ascending to ensure correct order
        const sortedData = result.data.sort((a, b) => a.logId - b.logId);
        setScheduleLogs(sortedData);
        setFilteredLogs(sortedData);
        setTotalCount(result.total);
        setCurrentPage(1); // Reset to first page on new fetch
      } else {
        throw new Error(result.message || "Failed to fetch schedule logs");
      }
    } catch (err) {
      console.error("Error fetching schedule logs:", err);
      setError(err.message);
      setScheduleLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchScheduleLogs();
  }, []);

  // Apply filters when filter type changes
  useEffect(() => {
    if (filterType === "all") {
      fetchScheduleLogs();
    }
  }, [filterType]);

  // Handle filter application
  const handleApplyFilter = () => {
    fetchScheduleLogs();
  };

  // Handle refresh
  const handleRefresh = () => {
    setFilterType("all");
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchScheduleLogs();
  };

  // Pagination calculations
  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="p-8 w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6">Scheduling Dashboard</h1>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* Date Filter Type */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="single">Select Date</option>
              <option value="range">Between Dates</option>
            </select>
          </div>

          {/* Single Date Picker */}
          {filterType === "single" && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Date Range Pickers */}
          {filterType === "range" && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Apply Filter Button */}
          {filterType !== "all" && (
            <button
              onClick={handleApplyFilter}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filter
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          {/* Rows Per Page */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rows Per Page
            </label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error loading schedule logs:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && currentLogs.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterType !== "all"
                ? "Try adjusting your filters or refresh to see all logs."
                : "No scheduling logs are available in the database."}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && currentLogs.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-600 text-sm border-b">
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">ITI Name</th>
                    <th className="py-3 px-4">Machine Name</th>
                    <th className="py-3 px-4">Worker Name</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Scheduled On</th>
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {currentLogs.map((log) => (
                    <tr
                      key={log.logId}
                      className="border-b last:border-none hover:bg-gray-50 text-gray-700 text-sm"
                    >
                      <td className="py-4 px-4">#{log.logId}</td>
                      <td className="py-4 px-4">{log.itiName}</td>
                      <td className="py-4 px-4">{log.machineName}</td>
                      <td className="py-4 px-4">{log.workerName}</td>
                      <td className="py-4 px-4">{log.studentName}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {formatDate(log.scheduledOn)}
                      </td>
                      <td className="py-4 px-4">{formatTime(log.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstLog + 1} to{" "}
                {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
                {filteredLogs.length} entries
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span key={pageNumber} className="px-2 py-1 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
