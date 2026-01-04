import React, { useState } from "react";
import {
  RiBookOpenLine,
  RiCheckFill,
  RiCloseFill,
  RiTimeLine,
} from "react-icons/ri";

export default function TOLogbookPage() {
  const [activeTab, setActiveTab] = useState("Pending");

  const logs = [
    { id: 1, student: "John Doe", task: "Task 3", machine: "Machine B", date: "April 5, 2025", time: "02:15 PM" },
    { id: 2, student: "John Doe", task: "Task 3", machine: "Machine B", date: "April 5, 2025", time: "02:15 PM" },
    { id: 3, student: "John Doe", task: "Task 3", machine: "Machine B", date: "April 5, 2025", time: "02:15 PM" },
  ];

  return (
    <div className="p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Logbook Approvals</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg border 
            ${activeTab === tab ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatBox number="4" label="Tasks Today" />
        <StatBox number="3" label="Pending Approvals" />
        <StatBox number="25" label="Active Machines" />
      </div>

      {/* Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left (Log Entries) */}
        <div className="col-span-2 bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">John Doe</h2>

          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{log.task}</p>
                  <p className="text-sm text-gray-500">{log.date}</p>
                </div>

                <div className="text-gray-600">{log.machine}</div>

                <div className="text-right">
                  <p className="text-gray-700">{log.time}</p>
                  <p className="text-sm text-gray-400">Time Ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (Log Details) */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Log Entry Details</h3>

          <DetailRow label="Student" value="John Doe" />
          <DetailRow label="Task Performed" value="Task 3" />
          <DetailRow label="Machine Used" value="April 3, 2024" />

          <p className="mt-4 font-medium">Notes</p>
          <textarea
            className="w-full mt-2 p-3 rounded-lg border"
            rows="4"
            defaultValue="Task to be completed so that it can be used again"
          ></textarea>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg">
              <RiCheckFill /> Approve
            </button>
            <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2 rounded-lg">
              <RiCloseFill /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small Components */
const StatBox = ({ number, label }) => (
  <div className="bg-white p-6 rounded-xl shadow text-center">
    <p className="text-3xl font-bold">{number}</p>
    <p className="text-gray-500 text-sm">{label}</p>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="mb-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
