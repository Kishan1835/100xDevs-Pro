import React from "react";
import { FiCheckCircle, FiAlertTriangle, FiClock } from "react-icons/fi";

// Sample data — replace with API later
const criticalItems = [
  {
    icon: <FiCheckCircle className="text-blue-500 text-lg" />,
    title: "8 PENDING APPROVALS",
    subtitle: "New tasks pending review",
  },
  {
    icon: <FiAlertTriangle className="text-red-500 text-lg" />,
    title: "4 OVERDUE MAINTENANCE",
    subtitle: "Late by 3 days",
  },
  {
    icon: <FiAlertTriangle className="text-orange-500 text-lg" />,
    title: "BATCH MMV – 23B AT RISK",
    subtitle: "Pass rate below 65%",
  },
  {
    icon: <FiAlertTriangle className="text-red-500 text-lg" />,
    title: "WELDING UNIT DOWNTIME",
    subtitle: "Unexpected machine outage",
  },
  {
    icon: <FiAlertTriangle className="text-red-500 text-lg" />,
    title: "SLA BREACH DETECTED",
    subtitle: "Maintenance ticket T-1201",
  },
];

const pendingApprovals = [
  { task: "TO-0182", type: "TO", time: "2h ago" },
  { task: "ATO-0190", type: "ATO", time: "5h ago" },
  { task: "TO-0180", type: "TO", time: "7h ago" },
];

export default function PrincipalDashboard() {
  return (
    <div className="p-8">
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Principal Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Institution Overview & Approvals
        </p>
      </div>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-3 gap-6 mt-8 max-w-[1000px]">
        {/* Card 1 */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-slate-500">TRAINING COMPLETION</div>
          <div className="text-2xl font-bold mt-2">84%</div>
          <div className="text-green-600 text-sm mt-1">↑ 2.1%</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-slate-500">PASS RATE</div>
          <div className="text-2xl font-bold mt-2">76%</div>
          <div className="text-green-600 text-sm mt-1">↑ 1.0%</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-slate-500">AVG ATTENDANCE</div>
          <div className="text-2xl font-bold mt-2">92%</div>
          <div className="text-green-600 text-sm mt-1">↑ 0.4%</div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-2 gap-8 mt-10">
        {/* LEFT — CRITICAL ITEMS */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">
            Critical Items
          </h2>

          <ul className="space-y-5">
            {criticalItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div>{item.icon}</div>
                <div>
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.subtitle}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — PENDING APPROVALS */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">
            Pending Approvals
          </h2>

          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-slate-500 border-b">
                <th className="py-2">Tasks</th>
                <th className="py-2">Type</th>
                <th className="py-2">Time</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {pendingApprovals.map((p, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-3">{p.task}</td>
                  <td>{p.type}</td>
                  <td>{p.time}</td>
                  <td>
                    <button className="px-3 py-1 text-sm bg-slate-100 border rounded-md hover:bg-slate-200">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* FOOTER LINKS */}
          <div className="mt-5 space-y-1">
            <button className="text-blue-600 text-sm hover:underline">
              View Reports
            </button>
            <button className="text-blue-600 text-sm hover:underline block">
              View Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
