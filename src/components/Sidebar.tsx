"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCartStore } from "../lib/cartStore";
import CartSidebar from "./CartSidebar";
import { User } from "@supabase/supabase-js";
import { useNavigation } from "./NavigationProvider";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User | null;
}

export default function Sidebar({ isOpen, setIsOpen, user }: SidebarProps) {
  const pathname = usePathname();
  const { navigate } = useNavigation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { totalItems, isLoading, setIsCartOpen } = useCartStore();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Chefs", path: "/chefs" },
    { name: "Menus", path: "/menus" },
    { name: "Contact", path: "/contact" },
    { name: "Book a Table", path: "/book-a-table" },
    ...(user
      ? [
          { name: "Account", path: "/account" },
          ...(user?.email === "stallionmarket24@gmail.com"
            ? [{ name: "Panel", path: "/panel" }]
            : []),
        ]
      : [{ name: "Login", path: "/login" }]),
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-[80%] sm:w-[350px] bg-black text-white shadow-lg transform overflow-scroll ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-500 ease-in-out max-custom:block hidden z-50 pt-4 custom-scrollbar`}
        style={{ background: "#000000" }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white hover:text-[#d7a95f] focus:outline-none bg-transparent"
          style={{ background: "transparent" }}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex justify-center my-8">
          <button
            onClick={() => {
              sessionStorage.setItem("triggerLoadingAnimation", "true");
              navigate("/");
            }}
            className="bg-transparent"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
              alt="Logo"
              width={120}
              height={40}
              className="bg-transparent"
              style={{ background: "transparent" }}
              priority
            />
          </button>
        </div>
        <div className="px-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-base font-medium res__font bg-transparent ${
                pathname === link.path
                  ? "text-[#d7a95f] border-l-4 border-[#d7a95f]"
                  : "text-white hover:text-[#d7a95f] hover:border-l-4 hover:border-[#d7a95f]"
              } transition-all duration-300`}
              style={{ background: "transparent" }}
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsCartOpen(true);
            }}
            className="relative block px-3 py-2 text-base font-medium text-white hover:text-[#d7a95f] res__font bg-transparent"
            disabled={isLoading}
            style={{ background: "transparent" }}
          >
            Cart
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-[#d7a95f] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
        <div className="px-4 mt-8 text-center space-y-2 pb-[2rem]">
          <p className="text-[18px] sm:text-xl font-medium text-[#d7a95f] stallion__font">
            Visit Us
          </p>
          <p className="text-[18px] sm:text-xl text-white res__font">
            Baker Street, London, UK
          </p>
          <p className="text-[18px] sm:text-xl text-white res__font">
            Daily: 8.00 am to 10.00 pm
          </p>
          <p className="text-[18px] sm:text-xl text-white res__font">
            info@stallionrestaurant.co.uk
          </p>
          <p className="text-[18px] sm:text-xl font-medium text-[#d7a95f] stallion__font">
            Booking Request
          </p>
          <p className="text-[18px] sm:text-xl text-white res__font">
            +44 20 7946 0958
          </p>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 max-custom:block hidden z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      <CartSidebar
        isOpen={useCartStore().isCartOpen}
        setIsOpen={setIsCartOpen}
      />
    </>
  );
}
