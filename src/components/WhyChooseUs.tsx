"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import SkeletonLoader from "./SkeletonLoader";

export default function WhyChooseUs() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback timeout
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setLoading(false); // Show content as soon as any image loads
  };

  const handleImageError = () => {
    setLoading(false); // Show content even if an image fails
  };

  return loading ? (
    <SkeletonLoader layout="whyChooseUs" />
  ) : (
    <section className="relative w-full bg-[#222] py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#d7a95f] mb-4 stallion__font relative z-10">
          Why Choose Us
        </h1>
        <Image
          src="/separator.svg"
          alt="Separator"
          width={150}
          height={20}
          className="w-[150px] mx-auto mb-4 relative z-10"
        />
        {/* Subheading */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-8 stallion__font relative z-10">
          Our Strength
        </h2>
        {/* Subsections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Subsection 1: Hygienic Food */}
          <div
            className="flex flex-col items-center bg-[#000] py-3 px-3"
            style={{ border: "5px ridge #d7a95f" }}
          >
            <div>
              <Image
                src="/features-icon-1.png"
                alt="Hygienic Food"
                width={120}
                height={120}
                className="w-[120px] object-cover rounded-lg shadow-md"
                onLoadingComplete={handleImageLoad}
                onError={handleImageError}
                priority
              />
            </div>
            <h3 className="text-xl sm:text-2xl text-[#d7a95f] mt-4 stallion__font">
              Hygienic Food
            </h3>
            <p className="text-base sm:text-lg text-white mt-2 max-w-xs mx-auto">
              Our kitchen prioritizes cleanliness and safety, ensuring every
              dish is prepared with the highest hygiene standards to delight
              your palate.
            </p>
          </div>
          {/* Subsection 2: Fresh Environment */}
          <div
            className="flex flex-col items-center bg-[#000] py-3 px-3"
            style={{ border: "5px ridge #d7a95f" }}
          >
            <div>
              <Image
                src="/features-icon-2.png"
                alt="Fresh Environment"
                width={120}
                height={120}
                className="w-[120px] object-cover rounded-lg shadow-md"
                onLoadingComplete={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            <h3 className="text-xl sm:text-2xl text-[#d7a95f] mt-4 stallion__font">
              Fresh Environment
            </h3>
            <p className="text-base sm:text-lg text-white mt-2 max-w-xs mx-auto">
              Dine in a vibrant, welcoming atmosphere designed to refresh your
              senses and enhance your dining experience.
            </p>
          </div>
          {/* Subsection 3: Skilled Chefs */}
          <div
            className="flex flex-col items-center bg-[#000] py-3 px-3"
            style={{ border: "5px ridge #d7a95f" }}
          >
            <div>
              <Image
                src="/features-icon-3.png"
                alt="Skilled Chefs"
                width={120}
                height={120}
                className="w-[120px] object-cover rounded-lg shadow-md"
                onLoadingComplete={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            <h3 className="text-xl sm:text-2xl text-[#d7a95f] mt-4 stallion__font">
              Skilled Chefs
            </h3>
            <p className="text-base sm:text-lg text-white mt-2 max-w-xs mx-auto">
              Our talented chefs bring creativity and expertise to every dish,
              crafting flavors that leave a lasting impression.
            </p>
          </div>
          {/* Subsection 4: Event & Party */}
          <div
            className="flex flex-col items-center bg-[#000] py-3 px-3"
            style={{ border: "5px ridge #d7a95f" }}
          >
            <div>
              <Image
                src="/features-icon-4.png"
                alt="Event & Party"
                width={120}
                height={120}
                className="w-[120px] object-cover rounded-lg shadow-md"
                onLoadingComplete={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            <h3 className="text-xl sm:text-2xl text-[#d7a95f] mt-4 stallion__font">
              Event & Party
            </h3>
            <p className="text-base sm:text-lg text-white mt-2 max-w-xs mx-auto">
              Host unforgettable events with our tailored catering and vibrant
              venues, perfect for any celebration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
