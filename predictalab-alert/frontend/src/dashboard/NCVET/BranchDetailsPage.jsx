import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { formatDistanceToNow } from "date-fns";

const API_BASE_URL = "http://localhost:5000/api";

export default function BranchDetailsPage() {
  const { itiId } = useParams();
  const navigate = useNavigate();

  const [iti, setIti] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [complaintTrend, setComplaintTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (itiId) {
      fetchBranchDetails();
    }
  }, [itiId]);

  const fetchBranchDetails = async () => {
    try {
      setLoading(true);
      console.log('[BranchDetails] Fetching data for ITI:', itiId);
      
      const [itiRes, activitiesRes, trendRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/branches/${itiId}`),
        axios.get(`${API_BASE_URL}/branches/${itiId}/recent-activities`),
        axios.get(`${API_BASE_URL}/branches/${itiId}/complaint-trend`)
      ]);

      console.log('[BranchDetails] ITI data:', itiRes.data);
      console.log('[BranchDetails] Activities data:', activitiesRes.data);
      console.log('[BranchDetails] Trend data:', trendRes.data);

      setIti(itiRes.data.data);
      setRecentActivities(activitiesRes.data.data);
      setComplaintTrend(trendRes.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching branch details:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error message:", err.message);
      setError(err.response?.data?.message || err.message || "Failed to load branch details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading branch details...</p>
      </div>
    );
  }

  if (error || !iti) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Branch not found"}</p>
          <button
            onClick={() => navigate("/ncv/dashboard/branches")}
            className="text-blue-600 hover:underline"
          >
            ← Back to Branches
          </button>
        </div>
      </div>
    );
  }

  // Prepare machine health distribution data for bar chart
  const machineHealthData = [
    { status: 'Healthy', count: iti.healthyMachines, fill: '#22C55E' },
    { status: 'Alert', count: iti.alertMachines, fill: '#EAB308' },
    { status: 'Critical', count: iti.criticalMachines, fill: '#EF4444' }
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Branch Details - {iti.name}
        </h1>
        <button
          onClick={() => navigate("/ncv/dashboard/branches")}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back to All Branches
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Machines" value={iti.totalMachines} />
        <StatCard title="Working Machines" value={iti.workingMachines} color="text-green-600" />
        <StatCard title="Students" value={iti.totalStudents} />
        <StatCard title="Workforce Count" value={iti.workforceCount} />
      </div>

      <div className="flex gap-6 border-b mb-6 text-sm font-medium">
        <span className="pb-2 border-b-2 border-blue-600 text-blue-600">
          Overview
        </span>
        <span className="text-gray-400 cursor-not-allowed">Complaints</span>
        <span className="text-gray-400 cursor-not-allowed">Maintenance</span>
        <span className="text-gray-400 cursor-not-allowed">Machines</span>
        <span className="text-gray-400 cursor-not-allowed">Workforce</span>
        <span className="text-gray-400 cursor-not-allowed">Scheduling</span>
      </div>

      <h2 className="text-lg font-semibold mb-4">Branch Summary</h2>

      <div className="grid grid-cols-2 gap-6 mb-10">
        {/* Machine Health Distribution Bar Chart */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Machine Health Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={machineHealthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Complaint Trend Line Chart */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Monthly Complaint Trend</h3>
          {complaintTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={complaintTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Complaints"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] bg-gray-50 rounded flex items-center justify-center">
              <p className="text-gray-400 text-sm">No complaint data available</p>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>

      {recentActivities.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 text-sm mb-6">
          {recentActivities.map((activity, index) => (
            <Activity
              key={activity.id}
              num={index + 1}
              title={activity.issue || 'Maintenance Activity'}
              time={activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : 'Unknown'}
              status={activity.status}
              severity={activity.severity}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
          <p className="text-gray-500 text-sm">No recent activities</p>
        </div>
      )}

      <div className="flex justify-end mt-10">
        <button
          onClick={() => navigate(`/ncv/dashboard/branches/${itiId}/report`)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Generate Report →
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, color = "text-gray-900" }) {
  return (
    <div className="border rounded-lg p-4 text-sm">
      <p className="text-gray-500">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Activity({ num, title, time, status, severity }) {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex gap-4 bg-gray-50 rounded-lg p-3">
      <span className="font-bold text-blue-600">{num}</span>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-500 text-xs">{time}</p>
          {severity && (
            <>
              <span className="text-gray-300">•</span>
              <span className={`text-xs font-medium ${getSeverityColor(severity)}`}>
                {severity}
              </span>
            </>
          )}
          {status && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-600">{status}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

