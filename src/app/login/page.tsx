"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#222] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 pt-[6.5rem] sm:pt-[10.5rem]">
        {/* Logo */}
        <Link href="/" className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Stallion Restaurant"
            width={150}
            height={50}
          />
        </Link>
        <h2 className="mt-6 text-center text-lg sm:text-xl font-semibold text-white stallion__font">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white res__font"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white res__font"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
            />
          </div>
          {error && <p className="text-red-500 text-sm res__font">{error}</p>}
          <div className="text-center">
            <p className="text-white res__font">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#d7a95f] hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
          <button
            type="submit"
            className="w-full font-bold text-md sm:text-xl relative overflow-hidden 
             border-2 border-[#d7a95f] text-[#d7a95f] px-6 py-3 
             transition-all duration-500 ease-in-out 
             group disabled:opacity-50 disabled:cursor-not-allowed
             hover:text-white"
          >
            {/* Golden background slide up on hover */}
            <span
              className="absolute inset-0 bg-[#d7a95f] w-full h-0 bottom-0 left-0 
                   transition-all duration-500 ease-in-out z-0 
                   group-hover:h-full"
            ></span>

            {/* Yeh layer border ko hamesha visible rakhega hover pe bhi */}
            <span
              className="absolute inset-0 border-2 border-[#d7a95f] pointer-events-none 
                   transition-opacity duration-300 
                   group-hover:opacity-0"
            ></span>

            {/* Button text */}
            <span className="relative z-10">Login</span>
          </button>
        </form>
      </div>
    </div>
  );
}
