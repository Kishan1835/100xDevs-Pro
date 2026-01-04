import React from "react";
import { MdFilterList } from "react-icons/md";
import image4 from "../assets/image-4.svg";   // NCVET
import image5 from "../assets/image-5.svg";   // G20

// Clerk
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export const Header = () => {
  return (
    <header className="w-full bg-white border-b border-[#e6edf5] h-[90px] flex items-center justify-between px-8 shadow-sm z-50">

      {/* Left - Logos */}
      <div className="flex items-center gap-4">
        <img src={image4} alt="NCVET" className="h-[62px]" />
        <h1 className="text-[17px] font-semibold text-gray-800 leading-tight max-w-[390px]">
          National Council for Vocational Education and Training
        </h1>
      </div>

      {/* Right - Icons + Auth */}
      <div className="flex items-center gap-4">

        <img src={image5} alt="G20" className="h-[50px]" />

        {/* Filter Icon */}
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer bg-white">
          <MdFilterList className="text-xl text-gray-600" />
        </div>

        {/* Auth Section */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="h-10 px-5 rounded-full bg-[#0d6efd] text-white text-sm font-medium">
              Login
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>

      </div>

    </header>
  );
};
