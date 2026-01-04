import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMachineData } from "../../context/MachineDataContext";
import { AiOutlineArrowLeft } from "react-icons/ai";
import axios from "axios";
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer
]);

const API_BASE_URL = "http://localhost:5000/api";

export default function MachineDetails() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const { machines, loading } = useMachineData();
  
  const [machineDetails, setMachineDetails] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [onHoldReason, setOnHoldReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  // Find the selected machine from context
  const machine = machines.find(m => m.machine_id === machineId);

  // Fetch additional details from backend
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoadingDetails(true);
        
        // Fetch machine details, maintenance history, and sensor data
        const [detailsRes, historyRes, sensorRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/machines/${machineId}/details`),
          axios.get(`${API_BASE_URL}/machines/${machineId}/maintenance-history`),
          axios.get(`${API_BASE_URL}/machines/${machineId}/sensor-latest`)
        ]);

        if (detailsRes.data.success) {
          setMachineDetails(detailsRes.data.data);
        }
        
        if (historyRes.data.success) {
          setMaintenanceHistory(historyRes.data.data);
        }
        
        if (sensorRes.data.success) {
          setSensorData(sensorRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching machine details:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    if (machineId) {
      fetchDetails();
    }
  }, [machineId]);

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    console.log("Changing status to:", newStatus);
    try {
      const res = await axios.patch(`${API_BASE_URL}/machines/${machineId}/update-status`, {
        newStatus
      });

      console.log("Status update response:", res.data);

      if (res.data.success) {
        alert("Status updated successfully!");
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to update status");
    }
  };

  // Handle on-hold submission
  const handleOnHoldSubmit = async () => {
    const reason = selectedReason === "Other" ? onHoldReason : selectedReason;
    
    if (!reason || reason.trim().length < 10) {
      alert("Please provide a reason (minimum 10 characters)");
      return;
    }

    try {
      const res = await axios.patch(`${API_BASE_URL}/machines/${machineId}/update-status`, {
        newStatus: "On Hold",
        reason
      });

      if (res.data.success) {
        alert("Machine put on hold successfully!");
        setShowOnHoldModal(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error putting machine on hold:", error);
      alert("Failed to update status");
    }
  };

  // Handle false alert
  const handleFalseAlert = async () => {
    if (!confirm("Are you sure this is a false alert?")) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/machines/${machineId}/false-alert`);

      if (res.data.success) {
        alert("Alert marked as false successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error marking false alert:", error);
      alert("Failed to mark as false alert");
    }
  };

  // Get current status from maintenance history
  const currentStatus = maintenanceHistory[0]?.status || "Unknown";

  console.log("Current Status:", currentStatus);
  console.log("Maintenance History:", maintenanceHistory);
  console.log("Machine Details:", machineDetails);

  if (loading || loadingDetails) {
    return (
      <div className="text-center py-20 text-gray-500">Loading machine data...</div>
    );
  }

  if (!machine) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Machine not found</p>
        <button
          onClick={() => navigate("/maintenance/machines")}
          className="text-blue-500 hover:text-blue-700"
        >
          Back to Machines
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7fb] min-h-screen px-6 pt-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/maintenance/machines")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <AiOutlineArrowLeft className="text-xl" />
        <span className="text-sm font-medium">Back to All Machines</span>
      </button>

      {/* Header with Machine ID and Name */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{machine?.machine_id}</h1>
        <p className="text-lg text-gray-600">{machine?.machine_type}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            if (currentStatus === "Pending" || currentStatus === "Unknown") handleStatusChange("In Progress");
            else if (currentStatus === "In Progress") handleStatusChange("Closed");
          }}
          className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          {currentStatus === "Pending" || currentStatus === "Unknown" ? "Start Maintenance" : 
           currentStatus === "In Progress" ? "Mark as Closed" : 
           "Change Status"}
        </button>

        <button
          onClick={() => setShowOnHoldModal(true)}
          className="px-6 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700"
        >
          Put On Hold
        </button>

        <button
          onClick={handleFalseAlert}
          className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700"
        >
          Mark as False Alert
        </button>
      </div>

      {/* Machine Header Info */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 mb-6 shadow-sm grid grid-cols-2 gap-4">
        <InfoBox title="Machine ID" value={machine.machine_id} />
        <InfoBox title="Machine Name" value={machine.machine_type} />
        <InfoBox title="Previous Faults" value="6" />
        <InfoBox title="Technician Assigned" value="R. Kumar" />
      </div>

      {/* Machine Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <MetricCard title="Temperature" value={`${parseFloat(machine.temperature).toFixed(2)}°C`} />
        <MetricCard title="Vibration" value={`${parseFloat(machine.vibration).toFixed(2)} mm/s`} />
        <MetricCard title="Current Usage" value={`${parseFloat(machine.current).toFixed(2)} A`} />
      </div>

      {/* AI Explanation */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">REASON</h3>
        <p className="text-base font-semibold text-gray-800 mb-4">{machine.explanation || "No explanation available"}</p>
        <div className="mt-4 flex items-center gap-6">
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Status: </span>
            <span className={`font-bold text-base ${
              machine.prediction_label.toLowerCase() === 'alert' ? 'text-orange-600' :
              machine.prediction_label.toLowerCase() === 'good' ? 'text-green-600' :
              machine.prediction_label.toLowerCase() === 'critical' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {machine.prediction_label}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Confidence: </span>
            <span className="font-bold text-base text-gray-800">{(machine.probability * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Machine Performance Graphs</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PerformanceChart 
            title="Time vs Temperature" 
            data={generateTimeSeriesData(machine.temperature, 'Temperature')}
            unit="°C"
            color="#ef4444"
          />
          <PerformanceChart 
            title="Time vs Vibration" 
            data={generateTimeSeriesData(machine.vibration, 'Vibration')}
            unit="mm/s"
            color="#f59e0b"
          />
          <PerformanceChart 
            title="Time vs Current" 
            data={generateTimeSeriesData(machine.current, 'Current')}
            unit="A"
            color="#3b82f6"
          />
        </div>
      </div>

      {/* Sensor Summary */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Sensor Readings at Fault Time</h3>
        
        {sensorData.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="text-left p-3">Sensor Name</th>
                <th className="text-left p-3">Value at Fault</th>
              </tr>
            </thead>
            <tbody>
              {sensorData.map((sensor, index) => (
                <tr key={index} className="border-b last:border-none text-gray-700">
                  <td className="p-3 font-medium">{sensor.sensorName}</td>
                  <td className="p-3">{sensor.valueAtFault}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">No sensor data available</p>
        )}
      </div>

      {/* Past Maintenance Logs */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Maintenance History</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-600 bg-gray-50">
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Issue Reported</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Assigned To</th>
            </tr>
          </thead>

          <tbody>
            {maintenanceHistory.length > 0 ? (
              maintenanceHistory.map((log, index) => {
                let statusColor = "bg-gray-100 text-gray-600";
                if (log.status === "Closed") statusColor = "bg-green-100 text-green-600";
                else if (log.status === "In Progress") statusColor = "bg-blue-100 text-blue-600";
                else if (log.status === "On Hold") statusColor = "bg-orange-100 text-orange-600";
                else if (log.status === "Pending") statusColor = "bg-yellow-100 text-yellow-600";

                return (
                  <tr key={index} className="border-b last:border-none text-gray-700 hover:bg-gray-50">
                    <td className="p-3">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-3">{log.issueReported}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${statusColor}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3">{log.workerName}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No maintenance history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* On-Hold Modal */}
      {showOnHoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reason for On-Hold</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Reason
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a reason --</option>
                <option value="Awaiting Parts">Awaiting Parts</option>
                <option value="Technician Not Available">Technician Not Available</option>
                <option value="Safety Check Pending">Safety Check Pending</option>
                <option value="Inspection Needed">Inspection Needed</option>
                <option value="Other">Other (Specify below)</option>
              </select>
            </div>

            {selectedReason === "Other" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specify Reason (min 10 characters)
                </label>
                <textarea
                  value={onHoldReason}
                  onChange={(e) => setOnHoldReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter detailed reason..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleOnHoldSubmit}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowOnHoldModal(false);
                  setSelectedReason("");
                  setOnHoldReason("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Helper Functions ===== */

// Generate time series data (simulated historical data)
const generateTimeSeriesData = (currentValue, metric) => {
  const data = [];
  const now = new Date();
  const baseValue = parseFloat(currentValue);
  
  // Generate 24 hours of data points (every hour)
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now - i * 60 * 60 * 1000);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Add some variation to the data
    const variation = (Math.random() - 0.5) * (baseValue * 0.1);
    const value = (baseValue + variation).toFixed(2);
    
    data.push({
      time: timeStr,
      value: parseFloat(value)
    });
  }
  
  return data;
};

/* ===== Chart Component ===== */

const PerformanceChart = ({ title, data, unit, color }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      title: {
        text: title,
        textStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937'
        },
        left: 'center',
        top: 15
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151'
        },
        formatter: function(params) {
          return `<strong>${params[0].axisValue}</strong><br/>${params[0].marker}${params[0].value.toFixed(2)} ${unit}`;
        }
      },
      grid: {
        left: '15%',
        right: '8%',
        top: '30%',
        bottom: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => item.time),
        axisLabel: {
          fontSize: 11,
          color: '#6b7280',
          interval: 4,
          rotate: 0
        },
        axisLine: {
          lineStyle: {
            color: '#d1d5db',
            width: 1
          }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: unit,
        nameLocation: 'end',
        nameTextStyle: {
          fontSize: 12,
          color: '#374151',
          fontWeight: '500',
          padding: [0, 0, 0, 10]
        },
        axisLabel: {
          fontSize: 11,
          color: '#6b7280',
          formatter: '{value}'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed'
          }
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#d1d5db'
          }
        }
      },
      series: [
        {
          name: title,
          type: 'line',
          smooth: true,
          data: data.map(item => item.value),
          lineStyle: {
            color: color,
            width: 3,
            shadowColor: color,
            shadowBlur: 4,
            shadowOffsetY: 2
          },
          itemStyle: {
            color: color,
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          symbolSize: 8,
          showSymbol: true,
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: color,
              scale: 1.2
            }
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    // Handle window resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [title, data, unit, color]);

  return (
    <div className="border border-[#dbe4f0] rounded-xl p-4 bg-white">
      <div ref={chartRef} style={{ width: '100%', height: '240px' }}></div>
    </div>
  );
};

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
