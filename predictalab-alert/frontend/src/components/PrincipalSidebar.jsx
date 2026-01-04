import React from "react";
import { NavLink } from "react-router-dom";
import { LuLayoutDashboard, LuGavel } from "react-icons/lu";

export default function PrincipalSidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/principal/dashboard/home",
      icon: <LuLayoutDashboard />,
    },
    {
      name: "Auction",
      path: "/principal/dashboard/auctions",
      icon: <LuGavel />,
    },
  ];

  return (
    <div className="w-[260px] h-screen bg-[#0A78B7] flex flex-col py-6 px-4 shadow-lg">
      {/* Menu Items */}
      <nav className="flex flex-col gap-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-medium 
              transition-all duration-300 ease-in-out group
              ${
                isActive
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white hover:scale-[1.02]"
              }`
            }
          >
            <span className="text-[20px] transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </span>
            <span className="font-semibold tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
