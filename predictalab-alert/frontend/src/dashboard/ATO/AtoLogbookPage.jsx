import React from "react";
import { FiPlus, FiFileText } from "react-icons/fi";
import { MdPendingActions } from "react-icons/md";

export default function AtoLogbookPage() {
  return (
    <div className="p-6">

      {/* --- PAGE TITLE --- */}
      <h1 className="text-3xl font-bold mb-6">Logbook</h1>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">

        <StatCard title="Entries Today" value="4" />
        <StatCard title="Pending Approval" value="23" />
        <StatCard title="Total Entries" value="56" />
        <StatCard title="Entries Today" value="14" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- RECENT LOGBOOK ENTRIES BOX --- */}
        <div className="col-span-2 bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Logbook Entries</h2>

          <div className="divide-y">
            {[
              { name: "Mansi", machine: "Machine A", status: "Submitted", color: "text-gray-600" },
              { name: "Priya", machine: "Machine A", status: "Approved", color: "text-green-600" },
              { name: "Arjun", machine: "Machine A", status: "Approved", color: "text-green-600" },
              { name: "Priya", machine: "Machine A", status: "Rejected", color: "text-red-600" },
            ].map((entry, index) => (
              <div key={index} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold">{entry.name}</p>
                  <p className="text-gray-500">Operating A</p>
                </div>

                <div className="text-gray-600">
                  <p>{entry.machine}</p>
                  <p>Nov-21 A</p>
                </div>

                <p className={`${entry.color} font-semibold`}>{entry.status}</p>
              </div>
            ))}
          </div>

          <button className="text-blue-600 mt-4 font-medium">View All Entries</button>
        </div>

        {/* --- QUICK ACTIONS BOX --- */}
        <div className="bg-white shadow rounded-xl p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="flex flex-col gap-4">

            <ActionButton 
              icon={<FiPlus size={20} />}
              text="Add Logbook Entry"
            />

            <ActionButton 
              icon={<MdPendingActions size={20} />}
              text="View Pending Approvals"
            />

            <ActionButton 
              icon={<FiFileText size={20} />}
              text="PDF Progdinq PDF"
            />

          </div>
        </div>

      </div>
    </div>
  );
}


/* ---------------------- SMALL COMPONENTS ---------------------- */

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-5 shadow rounded-xl text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-gray-500 text-sm">{title}</p>
    </div>
  );
}

function ActionButton({ icon, text }) {
  return (
    <button className="flex items-center gap-3 border p-3 rounded-lg w-full hover:bg-gray-100 transition">
      <div className="text-blue-600">{icon}</div>
      <span className="text-gray-700 text-sm font-medium">{text}</span>
    </button>
  );
}
