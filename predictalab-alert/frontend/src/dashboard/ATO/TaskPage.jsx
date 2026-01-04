// src/dashboard/ATO/TaskPage.jsx
import React from "react";
import { FiPlus, FiList } from "react-icons/fi";

export default function TaskPage() {
  return (
    <div className="w-full">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold mb-6">Task Dashboard</h1>

      {/* === STATS ROW === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard number="4" label="Tasks Today" />
        <StatCard number="3" label="Pending Approvals" />
        <StatCard number="25" label="Active Machines" />
        <StatCard number="96%" label="Attendance" />
        <StatCard number="120" label="Log Book Entries" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === TODAY'S TASK SECTION === */}
        <div className="col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Task</h2>

          <h3 className="text-sm font-semibold text-gray-500 mb-4">
            Today's Task Timeline
          </h3>

          {/* TIMELINE LIST */}
          <div className="relative border-l-2 border-gray-300 pl-6 space-y-6">

            {/* Task 1 */}
            <div className="relative">
              <span className="absolute -left-[1.65rem] w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></span>
              <p className="font-medium">Inspection</p>
              <p className="text-xs text-gray-500">Nov 24, 8:30 AM</p>
              <StatusTag label="Completed" color="bg-green-400" />
            </div>

            {/* Task 2 */}
            <div className="relative">
              <span className="absolute -left-[1.65rem] w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></span>
              <p className="font-medium">Task 2</p>
              <p className="text-xs text-gray-500">Nov 24, 10:30 AM</p>
              <StatusTag label="Completed" color="bg-green-400" />
            </div>

            {/* Task 3 */}
            <div className="relative">
              <span className="absolute -left-[1.65rem] w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></span>
              <p className="font-medium">Task 3</p>
              <p className="text-xs text-gray-500">Nov 24, 2:30 AM</p>
              <StatusTag label="Pending" color="bg-yellow-300" />
            </div>
          </div>

          {/* Link */}
          <button className="mt-4 text-blue-600 text-sm font-medium hover:underline">
            Open Full Task Dashboard
          </button>
        </div>

        {/* === QUICK ACTIONS === */}
        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="space-y-4">

            <button className="flex items-center gap-3 w-full border p-3 rounded-lg hover:bg-gray-50">
              <FiPlus className="text-blue-600 text-lg" />
              <span className="font-medium">Submit Task</span>
            </button>

            <button className="flex items-center gap-3 w-full border p-3 rounded-lg hover:bg-gray-50">
              <FiList className="text-blue-600 text-lg" />
              <span className="font-medium">Download Report</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

/* SMALL COMPONENTS */
const StatCard = ({ number, label }) => (
  <div className="bg-white shadow rounded-xl p-5 text-center">
    <p className="text-2xl font-bold">{number}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const StatusTag = ({ label, color }) => (
  <span
    className={`inline-block mt-2 px-3 py-1 text-sm rounded-lg bg-gray-100 flex items-center gap-2`}
  >
    <span className={`w-3 h-3 rounded-full ${color}`}></span>
    {label}
  </span>
);
