import React from "react";

export default function TOReports() {
  return (
    <div className="p-8">

      {/* ================= TITLE ================= */}
      <h1 className="text-2xl font-semibold mb-8">Reports Dashboard</h1>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-5 gap-6 max-w-5xl mb-12">
        <KPI number="4" label="Tasks Today" />
        <KPI number="3" label="Pending Approvals" />
        <KPI number="25" label="Active Machines" />
        <KPI number="96%" label="Attendance" />
        <KPI number="120" label="Log Book Entries" />
      </div>

      {/* ================= DOWNLOAD REPORTS ================= */}
      <section className="max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">Download Reports</h2>

        <div className="rounded-xl border border-gray-200 bg-white">
          {[
            "Task List Report",
            "Attendance Report",
            "Schedule Overview",
            "Log Book Summary",
            "Maintenance Report",
          ].map((title, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
            >
              <span className="text-gray-700">{title}</span>
              <span className="text-xl font-light">›</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

/* ================= SMALL KPI COMPONENT ================= */
const KPI = ({ number, label }) => (
  <div className="border border-gray-200 rounded-xl py-6 text-center bg-white">
    <h3 className="text-3xl font-semibold">{number}</h3>
    <p className="text-sm mt-1 text-gray-600">{label}</p>
  </div>
);
