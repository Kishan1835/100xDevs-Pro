import React, { useState, useEffect } from "react";
import axios from "axios";

const severityStyle = {
  High: "bg-gray-200 text-gray-700",
  Medium: "bg-gray-200 text-gray-700",
  Critical: "bg-gray-200 text-gray-700",
  Low: "bg-gray-200 text-gray-700",
  Healthy: "bg-gray-200 text-gray-700",
};

export default function ComplaintsPage() {
  const [stats, setStats] = useState({
    raisedCount: 0,
    inProgressCount: 0,
    solvedCount: 0
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComplaintData();
  }, []);

  const fetchComplaintData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both stats and branches data in parallel
      const [statsResponse, branchesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/complaints/stats'),
        axios.get('http://localhost:5000/api/complaints/branches')
      ]);

      setStats(statsResponse.data.data);
      setBranches(branchesResponse.data.data);
    } catch (err) {
      console.error('Error fetching complaint data:', err);
      setError('Failed to load complaint data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="bg-[#f4f7fb] min-h-screen px-6 pt-6 flex items-center justify-center">
        <div className="text-gray-600">Loading complaint data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f4f7fb] min-h-screen px-6 pt-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7fb] min-h-screen px-6 pt-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Raised" 
          value={stats.raisedCount} 
          color="text-red-500" 
        />
        <StatCard 
          title="In Progress" 
          value={stats.inProgressCount} 
          color="text-blue-500" 
        />
        <StatCard 
          title="Solved" 
          value={stats.solvedCount} 
          color="text-green-500" 
        />
      </div>

      {/* Table Title */}
      <h2 className="text-lg font-semibold mb-4">
        Branch-level Complaints
      </h2>

      {/* Table */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">

          {/* Header */}
          <thead className="bg-[#f8fbff] text-gray-600">
            <tr className="border-b">
              <th className="text-left p-4">Branch Name</th>
              <th className="text-center p-4">Issue Raised</th>
              <th className="text-center p-4">In Progress</th>
              <th className="text-center p-4">Solved</th>
              <th className="text-center p-4">Highest Severity</th>
              <th className="text-center p-4">ITI Score</th>
              <th className="text-center p-4">Last Updated</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {branches.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No branch data available
                </td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr 
                  key={branch.itiId} 
                  className="border-b last:border-none bg-[#fcfdff] hover:bg-[#f8fbff]"
                >

                  <td className="p-4 font-medium text-gray-800">
                    {branch.name}
                  </td>

                  <td className="p-4 text-center text-blue-600 font-medium">
                    {branch.raisedCount}
                  </td>

                  <td className="p-4 text-center text-blue-600 font-medium">
                    {branch.inProgressCount}
                  </td>

                  <td className="p-4 text-center text-blue-600 font-medium">
                    {branch.solvedCount}
                  </td>

                  {/* Severity */}
                  <td className="p-4 text-center">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-medium ${severityStyle[branch.highestSeverity] || severityStyle.Low}`}
                    >
                      {branch.highestSeverity}
                    </span>
                  </td>

                  {/* ITI Score Bar */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-[70px] h-[4px] bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${Math.min(branch.score, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-700 text-xs">{branch.score}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-center text-blue-600 text-xs font-medium">
                    {formatDate(branch.lastUpdated)}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, color }) => (
  <div className="bg-white border border-[#dbe4f0] rounded-xl px-6 py-5 text-center shadow-sm">
    <div className="text-sm font-medium text-gray-700 mb-1">
      {title}
    </div>
    <div className="text-2xl font-bold text-black">
      {value}
    </div>
  </div>
);
