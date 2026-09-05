"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import CartSidebar from "./CartSidebar";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../lib/cartStore";
import { MdOutlineShoppingBag } from "react-icons/md";
import { User } from "@supabase/supabase-js";
import { useNavigation } from "./NavigationProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { navigate } = useNavigation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { totalItems, isLoading, isCartOpen, setIsCartOpen } = useCartStore();

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
    // Fetch user on mount
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Handle scroll behavior
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 0);
      setIsVisible(currentScrollY <= 0 || currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };

    // Handle resize for screen size detection
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1000);
    };

    // Debounce scroll event
    let timeout: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleScroll, 50);
    };

    handleResize();
    window.addEventListener("scroll", debouncedScroll);
    window.addEventListener("resize", handleResize);

    // Handle body overflow for sidebar and cart
    document.body.style.overflow =
      isSidebarOpen || isCartOpen ? "hidden" : "auto";

    // Cleanup
    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
      authListener.subscription.unsubscribe();
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen, isCartOpen]); // Removed lastScrollY from dependencies

  useEffect(() => {
    // Ensure pathname is a string before using includes
    if (pathname && !["/cart", "/checkout"].includes(pathname)) {
      console.log(`Closing CartSidebar due to pathname change: ${pathname}`);
      setIsCartOpen(false);
    }
  }, [pathname, setIsCartOpen]);

  return (
    <>
      <nav
        className={`fixed w-full z-30 transition-all duration-500 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-black shadow-md top-0"
            : isLargeScreen
            ? "bg-transparent top-[55px]"
            : "bg-transparent top-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-5 py-4 sm:py-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => {
                  sessionStorage.setItem("triggerLoadingAnimation", "true");
                  navigate("/");
                }}
                className="bg-transparent"
              >
                <Image
                  src="/logo.png"
                  alt="Stallion Restaurant"
                  width={150}
                  height={50}
                  className="w-[120px] sm:w-[150px] bg-transparent"
                  style={{ background: "transparent" }}
                  priority
                />
              </button>
            </div>
            <div className="hidden custom:flex custom:items-center custom:space-x-4">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-3 py-2 text-md font-medium nav-link res__font bg-transparent ${
                    pathname === link.path
                      ? "text-[#d7a95f] active"
                      : isScrolled
                      ? "text-white hover:text-[#d7a95f]"
                      : "text-white hover:text-[#d7a95f]"
                  } transition-all duration-300`}
                  style={{ background: "transparent" }}
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => {
                  console.log("Opening CartSidebar via cart icon");
                  setIsCartOpen(true);
                }}
                className="relative px-3 py-2 text-white hover:text-[#d7a95f] res__font bg-transparent"
                disabled={isLoading}
                style={{ background: "transparent" }}
              >
                <MdOutlineShoppingBag size={27} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-2 bg-[#d7a95f] text-black text-sm font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center max-custom:block hidden bg-transparent">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white bg-transparent hover:text-[#d7a95f] focus:outline-none"
                style={{ background: "transparent" }}
              >
                <svg
                  className={`${isSidebarOpen ? "hidden" : "block"} h-8 w-8`}
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
                <svg
                  className={`${isSidebarOpen ? "block" : "hidden"} h-6 w-6`}
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
            </div>
          </div>
        </div>
      </nav>
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={user}
      />
      <CartSidebar isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
}
