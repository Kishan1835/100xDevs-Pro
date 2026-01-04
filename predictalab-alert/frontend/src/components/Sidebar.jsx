import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdMap,
  MdBusiness,
  MdReportProblem,
  MdBuild,
  MdGavel,
  MdPrecisionManufacturing,
} from "react-icons/md";

const menu = [
  { icon: <MdDashboard />, label: "Dashboard", path: "/ncv/dashboard/home" },
  { icon: <MdMap />, label: "Map", path: "/ncv/dashboard/map" },
  { icon: <MdBusiness />, label: "Branches", path: "/ncv/dashboard/branches" },
  { icon: <MdReportProblem />, label: "Complaints", path: "/ncv/dashboard/complaints" },
 
  { icon: <MdGavel />, label: "Auction", path: "/ncv/dashboard/auction" },
  
];

export const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside
      className="
        w-[220px]
        bg-[#0b77bd]
        min-h-[calc(100vh-90px)]
        mt-[12px]
        ml-[16px]
        rounded-2xl
        py-6
        shadow-md
        flex-shrink-0
      "
    >
      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const active = pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`
                flex items-center gap-4 mx-3 px-5 py-3 rounded-xl
                transition-all text-white text-[15px]
                ${active ? "bg-[#2F80ED] font-semibold" : "hover:bg-white/10"}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
