import React from "react";
import { FiPlus, FiDownload } from "react-icons/fi";

export default function AttendancePage() {
  return (
    <div className="p-6 w-full">
      {/* PAGE TITLE */}
      <h1 className="text-3xl font-semibold mb-8">Attendance</h1>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard value="96%" label="Attendance Rate" />
        <StatCard value="96" label="Total Students" />
        <StatCard value="90" label="Present Today" />
        <StatCard value="6" label="Absent Today" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* MAIN LEFT BLOCK - ATTENDANCE TABLE */}
        <div className="col-span-2 bg-white shadow-sm rounded-xl p-6 border">
          <h2 className="text-lg font-semibold mb-4">Today Attendance Overview</h2>

          {/* Present | Absent box */}
          <div className="flex justify-center gap-6 mb-6">
            <SmallStatBox title="Present" value="5" />
            <SmallStatBox title="Absent" value="5" />
          </div>

          <button className="text-blue-600 text-sm mb-4">View All Entries</button>

          {/* Attendance List */}
          <div className="space-y-3">
            <AttendanceItem name="Mansi" date="23 NOV 2025" status="Present" />
            <AttendanceItem name="Priya" date="23 NOV 2025" status="Absent" />
            <AttendanceItem name="Arjun" date="23 NOV 2025" status="Present" />
            <AttendanceItem name="Priya" date="23 NOV 2025" status="Absent" />
            <AttendanceItem name="Arjun" date="23 NOV 2025" status="Absent" />
          </div>

          <button className="text-blue-600 text-sm mt-4">View All Entries</button>
        </div>

        {/* RIGHT QUICK ACTIONS */}
        <div className="bg-white shadow-sm rounded-xl p-6 border h-fit">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="space-y-4">
            {/* Mark Attendance */}
            <QuickActionCard 
              icon={<FiPlus size={20} />} 
              text="Mark Attendance" 
            />

            {/* Download Report */}
            <QuickActionCard 
              icon={<FiDownload size={20} />} 
              text="Download Report" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- COMPONENTS ------------------ */

const StatCard = ({ value, label }) => (
  <div className="bg-white shadow-sm rounded-xl border p-6 text-center">
    <h3 className="text-3xl font-bold">{value}</h3>
    <p className="text-gray-600 text-sm mt-2">{label}</p>
  </div>
);

const SmallStatBox = ({ title, value }) => (
  <div className="bg-white border rounded-xl shadow-sm px-8 py-6 text-center">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const AttendanceItem = ({ name, date, status }) => (
  <div className="flex justify-between items-center text-sm">
    <div>{name}</div>
    <div className="text-gray-500">{date}</div>

    <div
      className={
        status === "Present"
          ? "text-green-600 font-medium"
          : "text-red-600 font-medium"
      }
    >
      {status}
    </div>
  </div>
);

const QuickActionCard = ({ icon, text }) => (
  <div className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition">
    <div className="text-blue-600">{icon}</div>
    <span className="font-medium">{text}</span>
  </div>
);
