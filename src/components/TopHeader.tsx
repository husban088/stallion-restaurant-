"use client";

import { useState, useEffect } from "react";
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function TopHeader() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1000);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`absolute top-0 w-full text-white z-30 transition-all duration-300 max-[1000px]:hidden ${
        isLargeScreen ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ borderBottom: "1px solid #d7a95f" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 py-3 flex flex-col md:flex-row justify-between items-center text-sm">
        {/* Left Side */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-7 w-7 text-[#d7a95f]" />
            <span className="text-[17px]">Baker Street, London, UK</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-7 w-7 text-[#d7a95f]" />
            <span className="text-[17px]">Daily: 8.00 am to 10.00 pm</span>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-2">
            <PhoneIcon className="h-7 w-7 text-[#d7a95f]" />
            <span className="text-[17px]">+44 20 7946 0958</span>
          </div>
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="h-7 w-7 text-[#d7a95f]" />
            <span className="text-[17px]">info@stallionrestaurant.co.uk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
