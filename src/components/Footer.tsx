"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { AiOutlineMail } from "react-icons/ai";
import { useNavigation } from "./NavigationProvider";
import toast from "react-hot-toast";

export default function Footer() {
  const pathname = usePathname();
  const { navigate } = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");

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
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    try {
      // Placeholder: Implement actual subscription logic (e.g., save to Supabase)
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe");
    }
  };

  return (
    <footer className="relative w-full bg-[url('/footer-bg.jpg')] bg-cover bg-center py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-center">
            <h3 className="text-2xl font-bold text-[#d7a95f] mb-4 stallion__font">
              Navigation
            </h3>
            <ul className="space-y-5 text-center md:text-center">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className={`nav-link bg-transparent text-base sm:text-lg text-white hover:text-[#d7a95f] transition-colors duration-300 res__font ${
                      pathname === link.path ? "text-[#d7a95f]" : ""
                    }`}
                    style={{ background: "transparent" }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center relative bg-[url('/footer-form-bg.png')] bg-cover w-full bg-black/15 py-8 rounded-lg">
            <Image
              src={`${
                process.env.NEXT_PUBLIC_BASE_PATH || ""
              }/footer-form-pattern.svg`}
              alt="Left Line Pattern"
              width={48}
              height={200}
              className="absolute -left-10 top-1/2 -translate-y-1/2 w-12 h-full opacity-50"
            />
            <Image
              src={`${
                process.env.NEXT_PUBLIC_BASE_PATH || ""
              }/footer-form-pattern.svg`}
              alt="Right Line Pattern"
              width={48}
              height={200}
              className="absolute -right-10 top-1/2 -translate-y-1/2 w-12 h-full opacity-50"
            />
            <div className="relative mb-6 z-10">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
                alt="Stallion Logo"
                width={150}
                height={50}
                className="w-[150px] h-auto bg-transparent"
                style={{ background: "transparent" }}
              />
            </div>
            <p className="text-base sm:text-lg text-center res__font mb-2 z-10">
              Baker Street, London, UK
            </p>
            <a
              href="mailto:info@stallionrestaurant.co.uk"
              className="text-base sm:text-lg text-center res__font hover:text-[#d7a95f] mb-2 z-10"
            >
              info@stallionrestaurant.co.uk
            </a>
            <p className="text-base sm:text-lg text-center res__font mb-2 z-10">
              Booking Request:
              <a
                href="tel:+442079460958"
                className="nav-link hover:text-[#d7a95f] ml-2"
              >
                +44 20 7946 0958
              </a>
            </p>
            <p className="text-base sm:text-lg text-center res__font mb-4 z-10">
              Daily: 10:00 AM - 10:00 PM
            </p>
            <div className="text-center mb-4 z-10">
              <h4 className="text-xl font-bold text-[#d7a95f] mb-2 stallion__font">
                Get News & Offers
              </h4>
              <p className="text-base sm:text-lg res__font mb-4">
                Subscribe us & Get 25% Off
              </p>
              <form
                onSubmit={handleSubscribe}
                className="flex items-center justify-center w-full max-w-sm mx-auto"
              >
                <div className="relative w-full">
                  <AiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-l-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d7a95f] text-white rounded-r-sm hover:bg-[#b5894c] transition-colors duration-300 res__font text-[1.1rem]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-center">
            <h3 className="text-2xl font-bold text-[#d7a95f] mb-4 stallion__font">
              Follow Us
            </h3>
            <ul className="space-y-4 text-center md:text-center">
              {[
                { name: "Facebook", url: "#" },
                { name: "Instagram", url: "#" },
                { name: "TikTok", url: "#" },
                { name: "YouTube", url: "#" },
              ].map((social) => (
                <li key={social.name}>
                  <a
                    href={social.url}
                    className="nav-link text-base sm:text-lg text-white hover:text-[#d7a95f] transition-colors duration-300 res__font"
                    style={{ background: "transparent" }}
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-gray-700 text-center">
          <p className="text-base sm:text-lg res__font">
            © 2025 Stallion Restaurant. All Rights Reserved | Crafted by
            <a
              href="https://pantrix-flax.vercel.app/"
              className="stallion__font text-[#d7a95f] border-b border-[#d7a95f] ml-1"
              style={{ background: "transparent" }}
            >
              Pantrix
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
