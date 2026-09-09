"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import SkeletonLoader from "./SkeletonLoader";
import { useNavigation } from "./NavigationProvider";

export default function SpecialDish() {
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
    <SkeletonLoader layout="specialDish" />
  ) : (
    <section className="relative w-full bg-[#000] py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2 flex justify-center">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/chiknqorma.jpg`}
              alt="Chicken Qorma"
              width={300}
              height={300}
              className="w-full sm:w-full h-full sm:h-full object-cover rounded-lg shadow-md aspect-square"
              onLoadingComplete={handleImageLoad}
              onError={handleImageError}
              priority
            />
          </div>
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/badge-1.png`}
                alt="Badge"
                width={20}
                height={20}
                className="w-[20px] h-[20px] mr-2 animate-batch"
              />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#d1a95d] stallion__font">
                Special Dish
              </h2>
            </div>
            <div>
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/separator.svg`}
                alt="Separator"
                width={150}
                height={20}
                className="w-[150px] mx-auto lg:mx-0 mb-4"
              />
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white stallion__font mb-4">
              Chicken Qorma
            </h3>
            <p className="text-lg sm:text-xl text-white max-w-md mx-auto lg:mx-0 res__font mb-6">
              Indulge in our exquisite Chicken Qorma, where tender chicken is
              simmered in a rich, aromatic blend of spices, finished with a
              creamy sauce that elevates every bite to pure bliss.
            </p>
            <div className="text-2xl sm:text-3xl font-bold text-[#d1a95d] mb-6 res__font">
              Rs350 - <span className="text-white ml-2">Rs600</span>
            </div>
            <div className="inline-block border-2 border-[#d7a95f]">
              <button
                onClick={() => navigate("/menus")}
                className="font-bold text-md sm:text-xl relative overflow-hidden border-2 border-[#d7a95f] text-[#d7a95f] px-6 py-2 transition-all duration-500 ease-in-out group w-fit res__font"
              >
                <span className="absolute inset-0 bg-[#d7a95f] w-full h-0 group-hover:h-full bottom-0 left-0 transition-all duration-500 ease-in-out z-0"></span>
                <span className="relative z-10 group-hover:text-white">
                  View All Menu
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
