import Image from "next/image";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { FaStar } from "react-icons/fa";

export default function Chefs() {
  const chefs = [
    {
      name: "James Whitfield",
      image: "/chef.jfif",
      intro:
        "With 20 years of culinary expertise, James Whitfield innovative dishes that blend tradition with modern flair, delighting every palate.",
    },
    {
      name: "Maria Lopez",
      image: "/girl.jpeg",
      intro:
        "Maria's passion for fresh ingredients shines in her vibrant creations, bringing Latin-inspired flavors to unforgettable dining experiences.",
    },
    {
      name: "Ahmed Khan",
      image: "/men.webp",
      intro:
        "Ahmed's mastery of spices creates bold, aromatic dishes that transport diners to the heart of culinary excellence.",
    },
  ];

  return (
    <div className="pt-16 min-h-screen bg-[#0D0C0B]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center pt-[4.5rem] sm:pt-[9rem]">
        {/* Heading */}
        <h2 className="text-4xl sm:text-4xl md:text-5xl text-[#d1a95d] stallion__font mb-4">
          Our Chef Team
        </h2>
        <div>
          <Image
            src="/separator.svg"
            alt="Separator"
            width={150}
            height={20}
            className="w-[150px] mx-auto mb-4"
          />
        </div>
        {/* Paragraph */}
        <p className="text-lg sm:text-xl text-white max-w-2xl mx-auto res__font mb-12">
          Meet our talented chefs who bring passion, creativity, and expertise
          to every dish, crafting unforgettable dining experiences at Stallion
          Restaurant.
        </p>
        {/* Chef Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {chefs.map((chef, index) => (
            <div
              key={index}
              className="relative bg-[#1a1a1a] border-2 border-[#d1a95d] rounded-md shadow-xl py-6 px-1 flex flex-col items-center"
            >
              {/* Chef Image and Inverted Commas */}
              <div className="relative -mt-12">
                <Image
                  src={chef.image}
                  alt={chef.name}
                  width={100}
                  height={100}
                  className="w-[120px] h-[120px] rounded-full object-cover border-4 border-[#d1a95d] mx-auto"
                />
                <FaQuoteLeft
                  className="absolute -left-[4rem] sm:-left-[6rem] top-1/2 transform -translate-y-1/2 text-[#d1a95d] text-4xl sm:text-5xl"
                  aria-hidden="true"
                />
                <FaQuoteRight
                  className="absolute -right-[4rem] sm:-right-[6rem] top-1/2 transform -translate-y-1/2 text-[#d1a95d] text-4xl sm:text-5xl"
                  aria-hidden="true"
                />
              </div>
              {/* Chef Name */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white gwendolyn__font mt-6 mb-2">
                {chef.name}
              </h3>
              {/* Stars */}
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className="text-yellow-400 text-xl"
                    aria-hidden="true"
                  />
                ))}
              </div>
              {/* Introduction */}
              <p className="text-lg sm:text-xl text-gray-300 stallion__font max-w-xs">
                {chef.intro}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
