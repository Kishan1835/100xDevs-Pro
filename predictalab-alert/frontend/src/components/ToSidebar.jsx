import React from "react";
import { NavLink } from "react-router-dom";

import {
  LuLayoutDashboard,
  LuBookOpen,
  LuClipboardList,
  LuClipboardCheck,
  LuWrench,
  LuFileText,
  LuBell,
  LuMonitor,
  LuCalendar,
  LuGavel,
} from "react-icons/lu";

export default function ToSidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/to/dashboard/home", icon: <LuLayoutDashboard /> },
    { name: "Logbook", path: "/to/logbook", icon: <LuBookOpen /> },
    { name: "Attendance", path: "/to/attendance", icon: <LuClipboardCheck /> },
    { name: "Machine Monitoring", path: "/to/machine-monitoring", icon: <LuMonitor /> },
    { name: "Scheduling", path: "/to/scheduling", icon: <LuCalendar /> },
    { name: "Auctions", path: "/to/auctions", icon: <LuGavel /> },
    { name: "Tasks", path: "/to/tasks", icon: <LuClipboardList /> },
    { name: "Maintenance", path: "/to/maintenance", icon: <LuWrench /> },
    { name: "Reports", path: "/to/reports", icon: <LuFileText /> },
    { name: "Notifications", path: "/to/notifications", icon: <LuBell /> },
  ];

  return (
    <div className="w-[260px] h-screen bg-[#0A74C9] text-white flex flex-col py-6 px-3 shadow-xl">
      

      {/* MENU */}
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg text-[15px] font-medium 
              transition-all duration-200
              ${isActive ? "bg-white text-[#0A74C9]" : "text-white hover:bg-[#FFFFFF33]"}`
            }
          >
            <span className="text-[18px]">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
