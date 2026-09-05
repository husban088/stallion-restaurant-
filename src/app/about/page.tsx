// app/about/page.tsx
"use client";

import Image from "next/image";
import { useNavigation } from "../../components/NavigationProvider";

export default function About() {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen">
      <section className="relative w-full bg-[#222] py-12 pb-[6.5rem] pt-[7rem] sm:pt-[14rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] mb-4 stallion__font text-center">
                Our Story
              </h2>
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/separator.svg`}
                alt="Separator"
                width={150}
                height={20}
                className="w-[150px] mx-auto mb-4 relative z-10"
              />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 stallion__font">
                Every Bite Tells a Story
              </h1>
              <p className="text-lg sm:text-xl text-white mb-8 max-w-2xl mx-auto lg:mx-0">
                At Stallion Restaurant, every dish is a chapter in our culinary
                journey. Founded with a passion for bold flavors and fresh
                ingredients, we craft experiences that linger in your memory.
                From our family to yours, we invite you to savor the stories
                woven into every bite, created with love and dedication.
              </p>
              <div className="flex flex-col items-center lg:items-center space-y-4">
                <span className="text-base sm:text-lg text-[#d7a95f] font-semibold">
                  Booking Through Call
                </span>
                <a
                  href="tel:+923360763840"
                  className="nav-link text-lg sm:text-xl text-white hover:text-[#d7a95f] transition-colors duration-300 res__font"
                >
                  +923360763840
                </a>
                <div className="border-2 border-[#d7a95f] inline-block">
                  <button
                    onClick={() => navigate("/book-a-table")} // No loading animation
                    className="font-bold text-md sm:text-xl relative overflow-hidden border-2 border-[#d7a95f] text-[#d7a95f] px-6 py-2 transition-all duration-500 ease-in-out group w-fit"
                  >
                    <span className="absolute inset-0 bg-[#d7a95f] w-full h-0 group-hover:h-full bottom-0 left-0 transition-all duration-500 ease-in-out z-0"></span>
                    <span className="relative z-10 group-hover:text-white res__font">
                      Book Now
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 relative w-full max-w-[500px]">
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_BASE_PATH || ""
                }/about-banner.jpg`}
                alt="Our Story"
                width={500}
                height={500}
                className="w-full h-[400px] sm:h-[500px] object-cover rounded-lg shadow-md z-10 relative"
              />
              <div className="absolute top-[-40px] right-[-1px] sm:right-[-10px] z-20">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/badge-2.png`}
                  alt="Circle Image"
                  width={100}
                  height={100}
                  className="object-cover rounded-full relative z-20"
                />
                <Image
                  src={`${
                    process.env.NEXT_PUBLIC_BASE_PATH || ""
                  }/badge-2-bg.png`}
                  alt="Rotating Ring"
                  width={120}
                  height={120}
                  className="absolute top-1 left-1/5 -translate-x-1/2 -translate-y-1/2 animate-rotate-slow z-30"
                />
              </div>
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_BASE_PATH || ""
                }/about-abs-image.jpg`}
                alt="Bottom Image"
                width={200}
                height={200}
                className="absolute bottom-[-90px] left-[-10px] sm:left-[-50px] object-cover rounded-lg shadow-md z-20"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
