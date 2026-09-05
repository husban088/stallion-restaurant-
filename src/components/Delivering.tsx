"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigation } from "./NavigationProvider";

export default function Delivering() {
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigation();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
  };

  return loading ? (
    <SkeletonLoader layout="delivering" />
  ) : (
    <section className="relative w-full bg-[#0D0C0B] py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/shape-1.png`}
          alt="Top Right Pattern"
          width={200}
          height={200}
          className="absolute top-0 right-0 animate-float"
        />
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/shape-2.png`}
          alt="Bottom Left Pattern"
          width={200}
          height={200}
          className="absolute bottom-0 left-0 animate-float"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#d1a95d] mb-6 stallion__font relative z-10">
          We Offer Elite Flavors
        </h1>
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/separator.svg`}
          alt="Separator"
          width={150}
          height={20}
          className="w-[150px] mx-auto mb-4 relative z-10"
        />
        <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto mb-16 res__font relative z-10">
          At Stallion Restaurant, we strive to overcome the challenge of
          sourcing only the freshest ingredients to create dishes that leave a
          lasting impression. Our commitment to quality ensures every bite is a
          moment to savor.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <div className="flex-1 relative z-10 mx-4 flex flex-col items-center">
            <div className="relative">
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_BASE_PATH || ""
                }/img-pattern.svg`}
                alt="Pattern Background"
                width={220}
                height={410}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[180px] sm:w-[220px] h-[370px] z-20"
              />
              <div className="relative shine-effect z-40">
                <Image
                  src={`${
                    process.env.NEXT_PUBLIC_BASE_PATH || ""
                  }/breakfast.jpg`}
                  alt="Breakfast"
                  width={280}
                  height={280}
                  className="w-[250px] sm:w-[280px] h-[250px] sm:h-[280px] object-cover rounded-lg shadow-md aspect-square"
                  onLoadingComplete={handleImageLoad}
                  onError={handleImageError}
                  priority
                />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl text-white sm:mt-[4rem] mt-[5rem] stallion__font">
              Breakfast
            </p>
            <button
              onClick={() => navigate("/menus")}
              className="view-menu-link text-[#d1a95d] text-lg sm:text-xl mt-2 inline-block bg-transparent mb-[4rem] sm:mb-[1rem] res__font"
            >
              View Menu
            </button>
          </div>
          <div className="flex-1 relative z-10 transform scale-105 mx-4 flex flex-col items-center">
            <div className="relative">
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_BASE_PATH || ""
                }/img-pattern.svg`}
                alt="Pattern Background"
                width={220}
                height={410}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[180px] sm:w-[220px] h-[370px] z-20"
              />
              <div className="relative shine-effect z-40">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/beef.jpg`}
                  alt="Appetizers"
                  width={280}
                  height={280}
                  className="w-[250px] sm:w-[280px] h-[250px] sm:h-[280px] object-cover rounded-lg shadow-md aspect-square"
                  onLoadingComplete={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl text-white sm:mt-[4rem] mt-[5rem] stallion__font">
              Appetizers
            </p>
            <button
              onClick={() => navigate("/menus")}
              className="view-menu-link text-[#d1a95d] text-lg sm:text-xl mt-2 inline-block bg-transparent mb-[4rem] sm:mb-[1rem] res__font"
            >
              View Menu
            </button>
          </div>
          <div className="flex-1 relative z-10 mx-4 flex flex-col items-center">
            <div className="relative">
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_BASE_PATH || ""
                }/img-pattern.svg`}
                alt="Pattern Background"
                width={220}
                height={410}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[180px] sm:w-[220px] h-[370px] z-20"
              />
              <div className="relative shine-effect z-40">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/drink.jpg`}
                  alt="Drinks"
                  width={280}
                  height={280}
                  className="w-[250px] sm:w-[280px] h-[250px] sm:h-[280px] object-cover rounded-lg shadow-md aspect-square"
                  onLoadingComplete={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl text-white sm:mt-[4rem] mt-[5rem] stallion__font">
              Drinks
            </p>
            <button
              onClick={() => navigate("/menus")}
              className="view-menu-link text-[#d1a95d] text-lg sm:text-xl mt-2 inline-block bg-transparent res__font"
            >
              View Menu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
