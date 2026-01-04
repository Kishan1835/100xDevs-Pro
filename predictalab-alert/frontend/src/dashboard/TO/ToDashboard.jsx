import React from "react";
import {
  FiClipboard,
  FiPlay,
  FiPauseCircle,
  FiTool,
} from "react-icons/fi";

export default function ToDashboard() {
  return (
    <div className="w-full">

      {/* ===========================
          PAGE TITLE + SUMMARY CARDS
      ============================ */}
      <h1 className="text-3xl font-bold mb-6">Training Officer Dashboard</h1>

      <div className="grid grid-cols-5 gap-5 mb-8">
        <SummaryCard number="4" label="Tasks Today" />
        <SummaryCard number="3" label="Pending Approvals" />
        <SummaryCard number="25" label="Active Machines" />
        <SummaryCard number="96%" label="Attendance" />
        <SummaryCard number="120" label="Log Book Enteries" />
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* ===========================
            TODAY KEY ACTIONS
        ============================ */}
        <div className="col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Today's Key Actions</h2>

          <div className="space-y-5">
            <ActionItem
              time="9.0"
              activity="Approve Logbook Entry"
              timestamp="02:00 AM"
            />
            <ActionItem
              time="11.2"
              activity="Monitor Machine C status"
              timestamp="03:00 AM"
            />
            <ActionItem
              time="15.3"
              activity="Review Training Session"
              timestamp="12:00 AM"
            />
          </div>

          <button className="text-blue-600 font-medium mt-4">
            View Full Activity
          </button>
        </div>

        {/* ===========================
            MACHINE HEALTH OVERVIEW
        ============================ */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Machine Health Overview</h2>

          <div className="grid grid-cols-3 text-center">
            <HealthStat number="18" label="Running" color="text-green-600" />
            <HealthStat number="5" label="Idle" color="text-yellow-500" />
            <HealthStat number="2" label="Under Maintenance" color="text-red-500" />
          </div>

          <div className="border-t my-4"></div>

          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <QuickLink label="Assign task" />
            <QuickLink label="Update Training Plan" />
          </div>
        </div>

        {/* ===========================
            APPROVALS SUMMARY
        ============================ */}
        <div className="col-span-2 bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Approvals Summary</h2>

          <div className="grid grid-cols-3 text-center">
            <ApprovalBox
              title="4 LogBook"
              status="Running"
              color="text-green-600"
            />
            <ApprovalBox
              title="4 Branch"
              status="Idle"
              color="text-yellow-500"
            />
            <ApprovalBox
              title="4 Branch C"
              status="Under Maintenance"
              color="text-red-500"
            />
          </div>
        </div>

        {/* ===========================
            SCHEDULE SNAPSHOT
        ============================ */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Schedule Snapshot</h2>

          <ScheduleRow time="10:00 AM" machine="Machine A" duration="30 mins" />
          <ScheduleRow time="10:00 AM" machine="Machine A" duration="30 mins" />
        </div>
      </div>
    </div>
  );
}

/* =======================
    SMALL COMPONENTS
======================= */

const SummaryCard = ({ number, label }) => (
  <div className="bg-white p-6 rounded-xl shadow text-center">
    <div className="text-2xl font-bold">{number}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const ActionItem = ({ time, activity, timestamp }) => (
  <div className="flex justify-between items-center">
    <div>
      <div className="text-sm text-gray-500">{time}</div>
      <div className="text-[15px] font-medium">{activity}</div>
    </div>
    <div className="text-sm text-gray-600">{timestamp}</div>
  </div>
);

const HealthStat = ({ number, label, color }) => (
  <div>
    <div className={`text-2xl font-bold ${color}`}>{number}</div>
    <div className="text-gray-600 text-sm">{label}</div>
  </div>
);

const QuickLink = ({ label }) => (
  <div className="text-blue-600 font-medium cursor-pointer">{label}</div>
);

const ApprovalBox = ({ title, status, color }) => (
  <div>
    <div className="font-semibold text-[15px]">{title}</div>
    <div className={`mt-1 ${color}`}>{status}</div>
  </div>
);

const ScheduleRow = ({ time, machine, duration }) => (
  <div className="flex justify-between items-center text-[15px] mb-3">
    <div>
      {time} <span className="font-medium">{machine}</span>
    </div>
    <div className="text-gray-600">{duration}</div>
  </div>
);
