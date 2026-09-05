"use client";

import { useEffect, useRef } from "react";

interface PanelSidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function PanelSidebar({
  isOpen,
  closeSidebar,
  activeTab,
  setActiveTab,
}: PanelSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };

    const mainContent = document.querySelector(".main-content");

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
      if (mainContent) {
        mainContent.classList.add("blur-sm");
      }
    } else {
      document.body.style.overflow = "";
      if (mainContent) {
        mainContent.classList.remove("blur-sm");
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
      if (mainContent) {
        mainContent.classList.remove("blur-sm");
      }
    };
  }, [isOpen, closeSidebar]);

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-black/90 w-64 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      ref={sidebarRef}
    >
      <div className="flex flex-col p-6 space-y-4">
        <button
          className="self-end text-white hover:text-[#d7a95f]"
          onClick={closeSidebar}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {["Add Food", "Orders", "Table Booked", "Contacts"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab.toLowerCase().replace(" ", "_"));
              closeSidebar();
            }}
            className={`text-left text-md font-medium res__font ${
              activeTab === tab.toLowerCase().replace(" ", "_")
                ? "text-[#d7a95f]"
                : "text-white hover:text-[#d7a95f]"
            } transition-all duration-300`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
