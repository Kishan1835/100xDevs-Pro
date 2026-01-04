import React from "react";
import { useMachineData } from "../../context/MachineDataContext";

export default function MachineMonitoring() {
  const { machines, loading } = useMachineData();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Machine Monitoring</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600 font-medium">
              <th className="py-3 px-4">Machine ID</th>
              <th className="py-3 px-4">Machine Type</th>
              <th className="py-3 px-4">Temp</th>
              <th className="py-3 px-4">Vibration</th>
              <th className="py-3 px-4">Current (A)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">REASON </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500">
                  Loading machine data...
                </td>
              </tr>
            ) : (
              machines.map((m, index) => {
                // Use the prediction label from InfluxDB
                const predictionLabel = m.prediction_label || m.prediction || "Unknown";
                const statusLower = predictionLabel.toLowerCase();
                
                let statusColor = "bg-gray-200 text-gray-700"; // default
                if (statusLower === "good" || statusLower === "healthy") {
                  statusColor = "bg-green-200 text-green-700";
                } else if (statusLower === "alert" || statusLower === "warning") {
                  statusColor = "bg-orange-200 text-orange-700";
                } else if (statusLower === "critical" || statusLower === "danger") {
                  statusColor = "bg-red-200 text-red-700";
                }

                return (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">{m.machine_id}</td>
                    <td className="py-3 px-4">{m.machine_type}</td>
                    <td className="py-3 px-4">{m.temperature}°C</td>
                    <td className="py-3 px-4">{m.vibration}</td>
                    <td className="py-3 px-4">{m.current}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${statusColor}`}
                      >
                        {predictionLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                      {m.explanation || "No explanation available"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
