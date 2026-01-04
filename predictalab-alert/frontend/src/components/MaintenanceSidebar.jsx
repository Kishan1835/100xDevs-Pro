// src/dashboard/Maintenance/MaintenanceSidebar.jsx
import React from "react";
import { FiGrid, FiTool, FiFileText, FiBell, FiClock, FiList, FiHardDrive } from "react-icons/fi";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/maintenance/dashboard", label: "Dashboard", icon: <FiGrid /> },
  { to: "/maintenance/machines", label: "Machines", icon: <FiHardDrive /> },
  { to: "/maintenance/notifications", label: "Notification", icon: <FiBell /> }
];

export default function MaintenanceSidebar() {
  return (
    <aside className="w-[220px] bg-[#0f88c5] text-white min-h-screen p-6 pt-8 flex flex-col gap-6">
      {/* top rounded block like reference */}
      <div className="rounded-md h-[420px] bg-[#0f88c5] w-full">
        <nav className="mt-8 flex flex-col gap-6">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                  isActive ? "bg-white/20 text-white font-semibold" : "text-white/90 hover:bg-white/10"
                }`
              }
            >
              <span className="text-lg">{it.icon}</span>
              <span className="text-[16px]">{it.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}