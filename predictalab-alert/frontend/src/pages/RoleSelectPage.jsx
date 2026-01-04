import React from "react";
import { useNavigate } from "react-router-dom";

import ncvetIcon from "../assets/NCVT.jpeg";
import principalIcon from "../assets/PRINCIPAL.jpeg";
import assistantIcon from "../assets/ASSISTANT TRAINING OFFICER.jpeg";
import trainingIcon from "../assets/TRAINING OFFICER.jpeg";
import maintenanceIcon from "../assets/MAINTENANCE.jpeg";
import ncvetLogo from "../assets/image-4.svg";
import g20Logo from "../assets/image-5.svg";

const roles = [
  { id: 1, label: "POLICY MAKER", value: "POLICY_MAKER", icon: ncvetIcon },
  { id: 2, label: "PRINCIPAL", value: "LAB_PRINCIPAL", icon: principalIcon },
  { id: 3, label: "ASSISTANT TRAINING OFFICER", value: "ASSISTANT_TRAINING_OFFICER", icon: assistantIcon },
  { id: 4, label: "TRAINING OFFICER", value: "TRAINING_OFFICER", icon: trainingIcon },
  { id: 5, label: "MAINTENANCE", value: "MAINTENANCE", icon: maintenanceIcon },
];

function RoleCard({ role, onClick }) {
  return (
    <button
      className="w-56 h-48 bg-white border border-gray-200 shadow-md rounded-xl 
                 flex flex-col items-center justify-center gap-4
                 hover:shadow-xl hover:border-blue-500 transition-all duration-200"
      onClick={() => onClick(role.value)}
    >
      <img
        src={role.icon}
        alt={role.label}
        className="w-16 h-16 object-contain"
      />
      <div className="font-medium text-sm text-center tracking-wide">
        {role.label}
      </div>
    </button>
  );
}

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/sign-in?role=${role}`);
  };

  const topRow = roles.slice(0, 3);
  const bottomRow = roles.slice(3);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
        {/* Left - Logos */}
        <div className="flex items-center gap-4">
          <img src={ncvetLogo} alt="NCVET" className="h-[62px]" />
          <h1 className="text-[17px] font-semibold text-gray-800 leading-tight max-w-[390px]">
            National Council for Vocational Education and Training
          </h1>
        </div>

        {/* Right - G20 Logo */}
        <div className="flex items-center">
          <img src={g20Logo} alt="G20" className="h-[50px]" />
        </div>
      </header>

      {/* Role Cards */}
      <main className="flex justify-center mt-20 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12">
          {/* First row: 3 cards */}
          {topRow.map((role) => (
            <RoleCard key={role.id} role={role} onClick={handleSelect} />
          ))}

          {/* Second row: last 2 cards centered */}
          <div className="md:col-span-3 flex justify-center gap-12">
            {bottomRow.map((role) => (
              <RoleCard key={role.id} role={role} onClick={handleSelect} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
