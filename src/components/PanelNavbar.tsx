"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import PanelSidebar from "./PanelSidebar";

interface PanelNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function PanelNavbar({
  activeTab,
  setActiveTab,
}: PanelNavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="fixed w-full bg-black shadow-md z-50 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            onClick={() => {
              window.location.href = "/"; // Force full page reload
            }}
          >
            <Image
              src="/logo.png"
              alt="Stallion Restaurant"
              width={150}
              height={50}
              className="w-[120px] sm:w-[150px]"
            />
          </Link>
          <div className="hidden lg:flex space-x-4">
            {["Add Food", "Orders", "Table Booked", "Contacts"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab.toLowerCase().replace(" ", "_"));
                  closeSidebar();
                }}
                className={`px-3 py-2 text-md font-medium nav-link ${
                  activeTab === tab.toLowerCase().replace(" ", "_")
                    ? "text-[#d7a95f] active"
                    : "text-white hover:text-[#d7a95f]"
                } transition-all duration-300 res__font`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            className="lg:hidden text-white hover:text-[#d7a95f] focus:outline-none"
            onClick={toggleSidebar}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </nav>
      <PanelSidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </>
  );
}
