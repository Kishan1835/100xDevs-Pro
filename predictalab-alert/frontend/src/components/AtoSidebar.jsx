import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuBookOpen,
  LuCalendarClock,
  LuClipboardList,
  LuMonitor,
  LuWrench,
  LuFileText,
  LuBell,
} from "react-icons/lu";

export default function AtoSidebar() {
  const menu = [
    { name: "Dashboard", icon: <LuLayoutDashboard />, path: "/ato/dashboard/home" },
    { name: "Logbook", icon: <LuBookOpen />, path: "/ato/dashboard/logbook" },
    { name: "Scheduling", icon: <LuCalendarClock />, path: "/ato/dashboard/scheduling" },
    { name: "Attendance", icon: <LuClipboardList />, path: "/ato/dashboard/attendance" },
    { name: "Monitoring", icon: <LuMonitor />, path: "/ato/dashboard/monitoring" },
    { name: "Tasks", icon: <LuClipboardList />, path: "/ato/dashboard/tasks" },
    { name: "Maintenance", icon: <LuWrench />, path: "/ato/dashboard/maintenance" },
    { name: "Notifications", icon: <LuBell />, path: "/ato/dashboard/notifications" },
  ];

  return (
    <div className="w-[230px] h-screen bg-[#0A75C2] text-white flex flex-col py-8 px-5">


      {/* Menu Items */}
      <div className="flex flex-col gap-6">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 text-[15px] 
              ${isActive ? "font-semibold" : "font-normal opacity-90"}`
            }
          >
            <span className="text-[20px]">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
