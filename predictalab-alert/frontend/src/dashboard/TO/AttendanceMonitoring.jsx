import React from "react";

export default function AttendanceMonitoring() {
  return (
    <div className="w-full p-6">

      {/* -------- PAGE TITLE -------- */}
      <h1 className="text-3xl font-semibold mb-6">Attendance Monitoring</h1>

      {/* -------- TOP STATS -------- */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Stat number="4" label="Tasks Today" />
        <Stat number="3" label="Pending Approvals" />
        <Stat number="25" label="Active Machines" />
        <Stat number="96%" label="Attendance" />
        <Stat number="120" label="Log Book Enteries" />
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* ===========================================================
           LEFT SECTION: Attendance Table + Summary
        =========================================================== */}
        <div className="col-span-2">

          {/* -------- Batch Tabs -------- */}
          <div className="flex border-b mb-4">
            {["Batch A (90)", "Batch A (90)", "Batch A (90)", "ATO Mark"].map((tab, i) => (
              <button
                key={i}
                className={`px-5 py-2 text-sm font-medium border-b-2 ${
                  i === 0
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* -------- Attendance Table -------- */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <table className="w-full text-sm">
              <thead className="border-b text-gray-600">
                <tr>
                  <th className="text-left py-2">Student Name</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Time Marked</th>
                  <th className="text-left py-2">ATO Marked</th>
                </tr>
              </thead>

              <tbody>
                {[
                  { name: "John Doe", status: "Present", color: "bg-green-500", time: "09:05 AM", ato: "Arun" },
                  { name: "John Doe", status: "Absent", color: "bg-red-500", time: "09:05 AM", ato: "Arun" },
                  { name: "John Doe", status: "Present", color: "bg-green-500", time: "09:05 AM", ato: "Arun" },
                  { name: "John Doe", status: "Absent", color: "bg-red-500", time: "09:05 AM", ato: "Arun" },
                ].map((s, idx) => (
                  <tr key={idx} className="border-b last:border-none">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3">{s.time}</td>
                    <td className="py-3">{s.ato}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* -------- Summary Cards -------- */}
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard title="Branch Attendance Summary" items={["Batch A - 90%", "Batch A - 90%", "Batch A - 90%"]} />
            <SummaryCard title="Exceptions" items={["2 Students Absents", "3 days or More", "Batch A - 90%"]} />
          </div>

        </div>

        {/* ===========================================================
           RIGHT SECTION: Student Detail + Buttons
        =========================================================== */}
        <div className="space-y-6">

          {/* -------- Student Details -------- */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Priya Singh</h2>

            <div className="text-sm grid grid-cols-2 mb-4">
              <span className="text-gray-600">Enroll No</span>
              <span className="font-medium">321321321</span>

              <span className="text-gray-600">Batch</span>
              <span className="font-medium">A</span>

              <span className="text-gray-600">Trade</span>
              <span className="font-medium">Electrical</span>
            </div>

            <h3 className="font-semibold mt-4 mb-2">Attendance Details</h3>

            <div className="text-sm space-y-1">
              <DetailRow date="Nov 13" present="100%" absent="0%" />
              <DetailRow date="Nov 13" present="100%" absent="0%" />
              <DetailRow date="Nov 13" present="100%" absent="0%" />
            </div>
          </div>

          {/* -------- Buttons -------- */}
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md font-medium">
              Download Attendance Report
            </button>
            <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-md font-medium">
              View Monthly Summary
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

/* --------------------------------------------
   SMALL COMPONENTS
-------------------------------------------- */

const Stat = ({ number, label }) => (
  <div className="bg-white shadow rounded-lg p-4 text-center">
    <div className="text-2xl font-bold">{number}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const SummaryCard = ({ title, items }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <h3 className="font-semibold mb-3">{title}</h3>
    <ul className="text-sm text-gray-700 space-y-1">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  </div>
);

const DetailRow = ({ date, present, absent }) => (
  <div className="flex justify-between text-gray-700">
    <span>{date}</span>
    <span>{present}</span>
    <span>{absent}</span>
  </div>
);
