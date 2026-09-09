import Image from "next/image";

interface SkeletonLoaderProps {
  layout:
    | "hero"
    | "specialDish"
    | "delivering"
    | "whyChooseUs"
    | "about"
    | "account"
    | "bookATable"
    | "chefs"
    | "ordersTab"
    | "contactsTab"
    | "tableBookedTab"
    | "addFoodForm";
}

export default function SkeletonLoader({ layout }: SkeletonLoaderProps) {
  return (
    <div className="relative w-full animate-pulse">
      {layout === "hero" && (
        <div className="relative h-screen w-screen">
          <div className="absolute inset-0 bg-gray-700 opacity-60"></div>
          <div className="absolute top-[-3rem] sm:top-[6rem] inset-0 flex flex-col justify-center items-center text-center">
            <Image
              src="/logo.png"
              alt="Stallion Restaurant"
              width={150}
              height={50}
              className="mb-4"
            />
            <div className="h-6 w-40 bg-gray-600 rounded mb-4"></div>
            <div className="h-12 w-64 bg-gray-600 rounded mb-4"></div>
            <div className="h-5 w-80 bg-gray-600 rounded mb-4"></div>
            <div className="h-10 w-32 bg-gray-600 rounded"></div>
          </div>
          <div className="absolute bottom-[2.5rem] sm:bottom-[2rem] right-8 sm:right-12 md:right-16 w-[105px]">
            <div className="bg-gray-600 h-24 w-[105px] rounded"></div>
          </div>
        </div>
      )}

      {layout === "specialDish" && (
        <section className="w-full bg-[#000] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="w-[300px] h-[300px] bg-gray-600 rounded-lg"></div>
              </div>
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <div className="w-6 h-6 bg-gray-600 rounded-full mr-2"></div>
                  <div className="h-8 w-40 bg-gray-600 rounded"></div>
                </div>
                <div className="h-4 w-32 mx-auto lg:mx-0 mb-4 bg-gray-600 rounded"></div>
                <div className="h-10 w-64 mx-auto lg:mx-0 bg-gray-600 rounded mb-4"></div>
                <div className="h-16 w-80 mx-auto lg:mx-0 bg-gray-600 rounded mb-6"></div>
                <div className="h-8 w-40 mx-auto lg:mx-0 bg-gray-600 rounded mb-6"></div>
                <div className="h-10 w-32 mx-auto lg:mx-0 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {layout === "delivering" && (
        <section className="w-full bg-[#0D0C0B] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Image
              src="/logo.png"
              alt="Stallion Restaurant"
              width={150}
              height={50}
              className="mx-auto mb-4"
            />
            <div className="h-10 w-64 mx-auto bg-gray-600 rounded mb-4"></div>
            <div className="h-4 w-32 mx-auto mb-4 bg-gray-600 rounded"></div>
            <div className="h-16 w-96 mx-auto bg-gray-600 rounded mb-[7rem]"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-[4rem] sm:gap-8">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex-1 mx-4 flex flex-col items-center"
                >
                  <div className="w-[280px] h-[280px] bg-gray-600 rounded-lg"></div>
                  <div className="h-8 w-32 mt-[5rem] bg-gray-600 rounded"></div>
                  <div className="h-6 w-24 mt-2 bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {layout === "whyChooseUs" && (
        <section className="w-full bg-[#222] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Image
              src="/logo.png"
              alt="Stallion Restaurant"
              width={150}
              height={50}
              className="mx-auto mb-4"
            />
            <div className="h-10 w-64 mx-auto bg-gray-600 rounded mb-4"></div>
            <div className="h-4 w-32 mx-auto mb-4 bg-gray-600 rounded"></div>
            <div className="h-8 w-40 mx-auto bg-gray-600 rounded mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center bg-[#000] py-3 px-3 border-4 border-gray-600"
                >
                  <div className="w-[120px] h-[120px] bg-gray-600 rounded-lg"></div>
                  <div className="h-6 w-32 mt-4 bg-gray-600 rounded"></div>
                  <div className="h-16 w-64 mt-2 bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {layout === "about" && (
        <section className="relative w-full bg-[#222] py-12 pb-[6.5rem] pt-[7rem] sm:pt-[14rem]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="h-8 w-40 mx-auto bg-gray-600 rounded mb-4"></div>
                <div className="h-4 w-32 mx-auto mb-4 bg-gray-600 rounded"></div>
                <div className="h-12 w-64 mx-auto bg-gray-600 rounded mb-6"></div>
                <div className="h-24 w-full max-w-2xl mx-auto bg-gray-600 rounded mb-8"></div>
                <div className="flex flex-col items-center lg:items-center space-y-4">
                  <div className="h-6 w-32 bg-gray-600 rounded"></div>
                  <div className="h-6 w-40 bg-gray-600 rounded"></div>
                  <div className="h-10 w-32 bg-gray-600 rounded"></div>
                </div>
              </div>
              <div className="flex-1 relative w-full max-w-[500px]">
                <div className="w-full h-[400px] sm:h-[500px] bg-gray-600 rounded-lg"></div>
                <div className="absolute top-[-40px] right-[-10px] w-[100px] h-[100px] bg-gray-600 rounded-full"></div>
                <div className="absolute bottom-[-90px] left-[-50px] w-[200px] h-[200px] bg-gray-600 rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {layout === "account" && (
        <div className="min-h-screen bg-[#222] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto pt-[6rem] sm:pt-[10rem]">
            <div className="h-8 w-40 mx-auto bg-gray-600 rounded mb-8"></div>
            <div className="bg-black/80 p-6 rounded-lg border-2 border-gray-600">
              <div className="flex justify-center mb-6">
                <div className="w-[150px] h-[150px] bg-gray-600 rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="h-4 w-24 bg-gray-600 rounded"></div>
                  <div className="h-6 w-32 mt-1 bg-gray-600 rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-600 rounded"></div>
                  <div className="h-6 w-32 mt-1 bg-gray-600 rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-600 rounded"></div>
                  <div className="h-6 w-40 mt-1 bg-gray-600 rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-600 rounded"></div>
                  <div className="h-6 w-48 mt-1 bg-gray-600 rounded"></div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <div className="h-10 w-32 bg-gray-600 rounded"></div>
                <div className="h-10 w-32 bg-gray-600 rounded"></div>
              </div>
              <div className="mt-8">
                <div className="h-8 w-40 bg-gray-600 rounded mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-black/80 p-6 rounded-lg border-2 border-gray-600"
                    >
                      <div className="h-6 w-32 bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 w-40 bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 w-48 bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === "bookATable" && (
        <section className="relative w-full bg-[#222] py-12 pt-[10rem] sm:pt-[13rem]">
          <div className="absolute inset-0 bg-gray-700 opacity-80 z-0"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="h-12 w-96 mx-auto bg-gray-600 rounded mb-8"></div>
            <div className="flex flex-col items-center mb-12">
              <div className="w-[150px] h-[150px] bg-gray-600 rounded-full"></div>
              <div className="h-6 w-32 mt-4 bg-gray-600 rounded"></div>
            </div>
            <div className="bg-black/80 p-6 rounded-lg border-2 border-gray-600 flex flex-col lg:flex-row gap-12">
              <div className="flex-1">
                <div className="h-8 w-40 mx-auto bg-gray-600 rounded mb-4"></div>
                <div className="h-6 w-64 mx-auto bg-gray-600 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 h-12 bg-gray-600 rounded-sm"></div>
                    <div className="flex-1 h-12 bg-gray-600 rounded-sm"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 h-12 bg-gray-600 rounded-sm"></div>
                    <div className="flex-1 h-12 bg-gray-600 rounded-sm"></div>
                  </div>
                  <div className="w-full h-12 bg-gray-600 rounded-sm"></div>
                  <div className="w-full h-32 bg-gray-600 rounded-sm"></div>
                  <div className="w-full h-12 bg-gray-600 rounded"></div>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="w-full h-[500px] sm:h-[600px] bg-gray-600 rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {layout === "chefs" && (
        <div className="pt-16 min-h-screen bg-[#0D0C0B]">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center pt-[4.5rem] sm:pt-[9rem]">
            <div className="h-12 w-64 mx-auto bg-gray-600 rounded mb-4"></div>
            <div className="h-4 w-32 mx-auto mb-4 bg-gray-600 rounded"></div>
            <div className="h-16 w-96 mx-auto bg-gray-600 rounded mb-12"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="relative bg-[#1a1a1a] border-2 border-gray-600 rounded-md py-6 px-1 flex flex-col items-center"
                >
                  <div className="relative -mt-12">
                    <div className="w-[120px] h-[120px] bg-gray-600 rounded-full mx-auto"></div>
                  </div>
                  <div className="h-8 w-32 mt-6 bg-gray-600 rounded"></div>
                  <div className="flex justify-center mb-4 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 bg-gray-600 rounded-full mx-1"
                      ></div>
                    ))}
                  </div>
                  <div className="h-16 w-64 bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {layout === "ordersTab" && (
        <div className="bg-black/80 p-6 rounded-lg shadow-md pt-[9rem] sm:pt-[13rem]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-[#1a1a1a] p-4 rounded-lg border-2 border-gray-600 flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
                <div>
                  <div className="h-6 w-24 bg-gray-600 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-8 w-40 mx-auto bg-gray-600 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-black/80 p-6 rounded-lg border-2 border-gray-600"
              >
                <div className="h-6 w-32 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded mb-4"></div>
                <div className="h-6 w-32 bg-gray-600 rounded mb-2"></div>
                <div className="flex gap-4 py-2">
                  <div className="w-16 h-16 bg-gray-600 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                    <div className="h-4 w-16 bg-gray-600 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="h-10 w-24 bg-gray-600 rounded"></div>
                  <div className="h-10 w-24 bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === "contactsTab" && (
        <div className="bg-black/80 p-6 rounded-lg shadow-md">
          <Image
            src="/logo.png"
            alt="Stallion Restaurant"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <div className="h-8 w-40 mx-auto bg-gray-600 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-black/80 p-6 rounded-lg border-2 border-gray-600"
              >
                <div className="h-6 w-32 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === "tableBookedTab" && (
        <div className="bg-black/80 p-6 rounded-lg shadow-md">
          <Image
            src="/logo.png"
            alt="Stallion Restaurant"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <div className="h-8 w-40 mx-auto bg-gray-600 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-black/80 p-6 rounded-lg border-2 border-gray-600"
              >
                <div className="h-6 w-32 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-16 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === "addFoodForm" && (
        <div className="bg-black/80 p-6 rounded-lg shadow-md">
          <Image
            src="/logo.png"
            alt="Stallion Restaurant"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <div className="h-8 w-40 mx-auto bg-gray-600 rounded mb-8"></div>
          <div className="space-y-6">
            <div>
              <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
              <div className="h-10 w-full bg-gray-600 rounded"></div>
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
              <div className="flex flex-wrap gap-4">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="h-6 w-24 bg-gray-600 rounded"
                  ></div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-600 pt-4">
              <div className="h-6 w-32 bg-gray-600 rounded mb-4"></div>
              <div className="space-y-4">
                <div>
                  <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                  <div className="h-10 w-full bg-gray-600 rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                  <div className="h-32 w-full bg-gray-600 rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                  <div className="h-24 w-full bg-gray-600 rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-600 rounded mb-2"></div>
                  <div className="flex flex-wrap gap-4">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="h-6 w-24 bg-gray-600 rounded"
                      ></div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="h-10 w-24 bg-gray-600 rounded"></div>
                    <div className="h-10 w-24 bg-gray-600 rounded"></div>
                    <div className="h-10 w-24 bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-10 w-full bg-gray-600 rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
}
