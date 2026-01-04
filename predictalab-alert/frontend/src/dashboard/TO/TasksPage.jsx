import React from "react";
import { FiUserPlus } from "react-icons/fi";

export default function TOTasksPage() {
  return (
    <div className="p-6">

      {/* ---------- PAGE TITLE ---------- */}
      <h1 className="text-2xl font-semibold mb-6">Task Management</h1>

      {/* ---------- TOP STATS BOXES ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">

        <div className="border rounded-xl p-5 bg-white shadow-sm text-center">
          <div className="text-3xl font-bold">4</div>
          <div className="text-gray-600 text-sm">Pending Approval</div>
        </div>

        <div className="border rounded-xl p-5 bg-white shadow-sm text-center">
          <div className="text-3xl font-bold">3</div>
          <div className="text-gray-600 text-sm">Task Completed</div>
        </div>

        <div className="border rounded-xl p-5 bg-white shadow-sm text-center">
          <div className="text-3xl font-bold">5</div>
          <div className="text-gray-600 text-sm">In Progress</div>
        </div>

        <div className="border rounded-xl p-5 bg-white shadow-sm text-center">
          <div className="text-3xl font-bold">4</div>
          <div className="text-gray-600 text-sm">Overdue tasks</div>
        </div>
      </div>

      {/* ---------- TABLE CONTAINER ---------- */}
      <div className="bg-white border rounded-xl shadow-sm p-6">

        {/* Section Title */}
        <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Task</th>
                <th className="py-2">Assigned to</th>
                <th className="py-2">Due Date</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>

            <tbody className="text-gray-800">
              <tr className="border-b">
                <td className="py-3">Task 1</td>
                <td className="py-3">Name</td>
                <td className="py-3">Nov 25</td>
                <td className="py-3 text-blue-600">In Progress</td>
              </tr>

              <tr className="border-b">
                <td className="py-3">Task 2</td>
                <td className="py-3">Name</td>
                <td className="py-3">Nov 27</td>
                <td className="py-3 text-gray-500">Not Started</td>
              </tr>

              <tr className="border-b">
                <td className="py-3">Task 3</td>
                <td className="py-3">Name</td>
                <td className="py-3">Nov 30</td>
                <td className="py-3 text-gray-500">Nil</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- ASSIGN BUTTON ---------- */}
      <div className="mt-6">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
          <FiUserPlus size={16} />
          Assign New Task
        </button>
      </div>

    </div>
  );
}
