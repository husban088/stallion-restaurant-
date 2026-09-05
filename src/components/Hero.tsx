"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigation } from "./NavigationProvider";

export default function Hero() {
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
  };

  return loading ? (
    <SkeletonLoader layout="hero" />
  ) : (
    <div className="relative h-screen w-screen">
      <Image
        src="/banner.png"
        alt="Stallion Restaurant"
        fill
        className="absolute h-full w-full object-cover"
        onLoadingComplete={handleImageLoad}
        onError={handleImageError}
        priority
      />
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="absolute top-[-3rem] sm:top-[6rem] inset-0 flex flex-col justify-center items-center text-white text-center">
        <h2 className="text-xl sm:text-2xl md:text-2xl font-semibold mb-4 text-[#d7a95f] res__font">
          Premium Quality
        </h2>
        <h1 className="text-4xl sm:text-6xl mb-4 font-semibold stallion__font">
          STALLION
          <br />
          <span className="stallion__font">Restaurant</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl res__font">
          Come with family & feel the joy of mouthwatering food
        </p>
        <div className="mt-[0.7rem] sm:mt-[1.5rem] border-2 border-[#d7a95f]">
          <button
            onClick={() => navigate("/menus")}
            className="font-bold bg-transparent text-md sm:text-xl relative overflow-hidden border-2 border-[#d7a95f] text-[#d7a95f] px-6 py-2 transition-all duration-500 ease-in-out group w-fit sm:w-auto res__font inline-block"
          >
            <span className="absolute inset-0 bg-[#d7a95f] w-full h-0 group-hover:h-full bottom-0 left-0 transition-all duration-500 ease-in-out z-0"></span>
            <span className="relative z-10 group-hover:text-white">
              View our menu
            </span>
          </button>
        </div>
      </div>
      <div className="absolute bottom-[2.5rem] sm:bottom-[2rem] right-8 sm:right-12 md:right-16 w-[105px] sm:w-[105px] md:w-[105px]">
        <div className="absolute inset-[-5px] border-2 border-[#d7a95f] animate-[spin_6s_linear_infinite] z-0"></div>
        <button
          onClick={() => navigate("/book-a-table")}
          className="relative bg-[#d7a95f] flex flex-col items-center justify-between p-3 sm:p-2 md:p-3 z-10 w-[105px] sm:w-[105px] md:w-[105px]"
        >
          <Image
            src="/hero-icon.png"
            alt="Book a Table"
            width={40}
            height={40}
            className="w-[40px] sm:w-[35px] md:w-[40px] object-cover"
          />
          <p className="text-black text-center text-[10px] sm:text-[12px] font-semibold mt-1 res__font">
            BOOK A
            <br />
            <span>TABLE</span>
          </p>
        </button>
      </div>
    </div>
  );
}
