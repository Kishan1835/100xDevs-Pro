import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Utility function to get ITI score label and color
const getScoreLabel = (score) => {
  if (score >= 75) {
    return { label: "High Performing", color: "bg-green-100 text-green-600" };
  } else if (score >= 40) {
    return { label: "Moderate", color: "bg-yellow-100 text-yellow-600" };
  } else {
    return { label: "Needs Attention", color: "bg-red-100 text-red-600" };
  }
};

export default function BranchesPage() {
  const [itis, setItis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchITIs();
  }, []);

  const fetchITIs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/branches`);
      setItis(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching ITIs:", err);
      setError("Failed to load ITI data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f6f9fc] min-h-screen p-4 flex items-center justify-center">
        <p className="text-gray-500">Loading ITIs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f6f9fc] min-h-screen p-4 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f9fc] min-h-screen p-4">
      <h1 className="text-xl font-semibold mb-6">
        Industrial Training Institutes
      </h1>

      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="font-medium">Total ITIs:</span>
          <span className="px-4 py-1 rounded bg-blue-100 text-blue-600 font-semibold">
            {itis.length}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Showing {itis.length} institute{itis.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {itis.map((iti) => {
          const scoreInfo = getScoreLabel(iti.iti_score);
          
          return (
            <div
              key={iti.itiId}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold text-sm">{iti.name}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${scoreInfo.color}`}
                >
                  ● {scoreInfo.label}
                </span>
              </div>

              <p className="text-xs text-blue-500 mb-1">{iti.address}</p>
              <p className="text-xs text-gray-500 mb-4">
                {iti.city}, {iti.state}
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">ITI Score:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {iti.iti_score.toFixed(1)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      iti.iti_score >= 75
                        ? 'bg-green-500'
                        : iti.iti_score >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(iti.iti_score, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 text-xs mb-5">
                <div>
                  <p className="text-gray-500">Total Machines</p>
                  <p className="font-semibold">{iti.totalMachines}</p>
                </div>
                <div>
                  <p className="text-gray-500">Working Machines</p>
                  <p className="font-semibold text-green-600">
                    {iti.workingMachines}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Students</p>
                  <p className="font-semibold">{iti.totalStudents}</p>
                </div>
                <div>
                  <p className="text-gray-500">Workforce</p>
                  <p className="font-semibold">{iti.workforceCount}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 text-center">
                <Link
                  to={`/ncv/dashboard/branches/${iti.itiId}`}
                  className="text-sm text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
                >
                  View Full Details
                  <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {itis.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No ITIs found</p>
        </div>
      )}
    </div>
  );
}

