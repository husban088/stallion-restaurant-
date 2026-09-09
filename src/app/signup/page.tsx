"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be under 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          setError("Image must be under 5MB");
          return;
        }
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setError("Please upload an image file");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign up with Supabase Auth first to get user ID
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      let imageUrl = "";
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${authData.user.id}/${fileName}`; // Upload to user-specific folder
        const { error: uploadError } = await supabase.storage
          .from("user-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Failed to upload image: " + uploadError.message);
        }

        // Get public URL for the image
        imageUrl = supabase.storage.from("user-images").getPublicUrl(filePath)
          .data.publicUrl;
      }

      // Insert user data into users table
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          image_url: imageUrl,
        },
      ]);

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save user data: " + dbError.message);
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-lg sm:text-xl font-semibold text-white stallion__font text-center mb-8">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div
              className="relative w-32 h-32 rounded-full border-4 border-[#d7a95f] cursor-pointer bg-gray-800 flex items-center justify-center overflow-hidden"
              onClick={handleImageClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile Preview"
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-[#d7a95f]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-white res__font"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-white res__font"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-white res__font"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
              disabled={loading}
            />
          </div>
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm res__font">{error}</p>}
          <div className="text-center">
            <p className="text-white res__font">
              Already have an account?{" "}
              <Link href="/login" className="text-[#d7a95f] hover:underline">
                Login
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
            disabled={loading}
          >
            {/* Background slide-up effect */}
            <span
              className="absolute inset-0 bg-[#d7a95f] w-full h-0 bottom-0 left-0 
                   transition-all duration-500 ease-in-out z-0 
                   group-hover:h-full"
            ></span>

            {/* This extra div preserves the golden border on hover */}
            <span
              className="absolute inset-0 border-2 border-[#d7a95f] pointer-events-none 
                   transition-opacity duration-300 
                   group-hover:opacity-0"
            ></span>

            {/* Button text */}
            <span className="relative z-10">
              {loading ? "Signing Up..." : "Sign Up"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
