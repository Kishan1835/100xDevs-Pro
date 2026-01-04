import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { FiSliders } from "react-icons/fi";
import { MdPersonOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useMachineData } from "../../context/MachineDataContext";

export default function MachinePage() {
  const { machines, loading } = useMachineData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter machines based on search
  const filteredMachines = machines.filter(m =>
    m.machine_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f4f7fb] min-h-screen px-6 pt-6">

      {/* Search Row */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-[500px]">
          <AiOutlineSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search Machine ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[48px] border border-[#dbe4f0] rounded-2xl bg-white pl-12 pr-4 text-sm shadow-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-5">
          <FiSliders className="text-2xl text-gray-600 cursor-pointer" />
          <MdPersonOutline className="text-2xl text-gray-600 cursor-pointer" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading machine data...</div>
      ) : filteredMachines.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No machines found</div>
      ) : (
        <>
          {/* All Machines Table */}
          <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">All Machines</h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="text-left p-3">Machine ID</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Temperature</th>
                  <th className="text-left p-3">Vibration</th>
                  <th className="text-left p-3">Current</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3"></th>
                </tr>
              </thead>

              <tbody>
                {filteredMachines.map((machine, index) => {
                  const statusLower = machine.prediction_label.toLowerCase();
                  let statusColor = "bg-gray-100 text-gray-600";
                  if (statusLower === "good" || statusLower === "healthy") {
                    statusColor = "bg-green-100 text-green-600";
                  } else if (statusLower === "alert" || statusLower === "warning") {
                    statusColor = "bg-orange-100 text-orange-600";
                  } else if (statusLower === "critical" || statusLower === "danger") {
                    statusColor = "bg-red-100 text-red-600";
                  }

                  return (
                    <tr key={index} className="border-b last:border-none text-gray-700 hover:bg-gray-50">
                      <td className="p-3">{machine.machine_id}</td>
                      <td className="p-3">{machine.machine_type}</td>
                      <td className="p-3">{machine.temperature}°C</td>
                      <td className="p-3">{machine.vibration}</td>
                      <td className="p-3">{machine.current} A</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 text-xs rounded-full ${statusColor}`}>
                          {machine.prediction_label}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/maintenance/machines/${machine.machine_id}`)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
}

/* ===== Reusable UI Components ===== */

const InfoBox = ({ title, value }) => (
  <div className="border border-[#dbe4f0] rounded-lg p-4 bg-[#f9fbff]">
    <p className="text-xs text-gray-500 mb-1">{title}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

const MetricCard = ({ title, value }) => (
  <div className="bg-white border border-[#dbe4f0] rounded-xl px-6 py-5 text-center shadow-sm">
    <p className="text-sm text-gray-500 mb-2">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const GraphCard = ({ title }) => (
  <div className="border border-[#dbe4f0] rounded-xl p-4 bg-[#f9fbff]">
    <p className="text-sm font-medium mb-2 text-gray-700">{title}</p>
    <div className="h-[180px] bg-white rounded-lg flex items-center justify-center text-xs text-gray-400">
      {/* Replace with real chart later */}
      Chart Placeholder
    </div>
  </div>
);
