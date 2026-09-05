"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import DOMPurify from "isomorphic-dompurify";
import ReactHtmlParser from "react-html-parser";
import ProductModal from "../../components/ProductModal";
import { useCartStore } from "../../lib/cartStore";
import SkeletonLoader from "../../components/SkeletonLoader";

interface Food {
  id: string;
  type: "fast_food" | "fried_food";
  categories: string[];
  name: string;
  description: string;
  sizes: { size: string; price: number; cutPrice?: number }[];
  image_urls: string[];
}

export default function Menus() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<"fast_food" | "fried_food">(
    "fast_food"
  );
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<
    Record<string, string | null>
  >({});
  const { cartItems, addToCart, updateQuantity, setIsCartOpen } =
    useCartStore();

  useEffect(() => {
    const fetchFoods = async () => {
      const cachedFoods = localStorage.getItem("menuFoods");
      if (cachedFoods) {
        const initialFoods: Food[] = JSON.parse(cachedFoods);
        setFoods(initialFoods);
        const initialSizes: Record<string, string | null> = {};
        initialFoods.forEach((food) => {
          initialSizes[food.id] = food.sizes[0]?.size || null;
        });
        setSelectedSizes(initialSizes);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from("foods")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;

        setFoods(data || []);
        localStorage.setItem("menuFoods", JSON.stringify(data || []));
        const newSizes: Record<string, string | null> = {};
        data?.forEach((food) => {
          newSizes[food.id] = food.sizes[0]?.size || null;
        });
        setSelectedSizes(newSizes);
      } catch (error) {
        toast.error("Failed to fetch menu items. Please try again.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoods();

    const channel = supabase
      .channel("foods-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "foods" },
        () => {
          console.log("Real-time menu update triggered");
          fetchFoods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fastFoodCategories = ["Pizza", "Pasta", "Burger", "Fries"];
  const friedFoodCategories = ["Chicken Qorma", "Beef Qorma", "Mutton Qorma"];
  const categories =
    activeType === "fast_food" ? fastFoodCategories : friedFoodCategories;

  const filteredFoods = activeCategory
    ? foods.filter((food) => food.categories.includes(activeCategory))
    : foods.filter((food) => food.type === activeType);

  const groupedFoods = filteredFoods.reduce((acc, food) => {
    food.categories.forEach((category) => {
      if (!acc[category]) acc[category] = [];
      acc[category].push(food);
    });
    return acc;
  }, {} as Record<string, Food[]>);

  const calculateDiscount = (price: number, cutPrice?: number) => {
    if (!cutPrice || cutPrice <= price || price <= 0)
      return { percentOff: 0, savePrice: 0 };
    const discount = cutPrice - price;
    const percentOff = Math.round((discount / cutPrice) * 100);
    return { percentOff, savePrice: discount };
  };

  const openModal = (food: Food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFood(null);
  };

  const handleSizeSelect = (foodId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [foodId]: size,
    }));
  };

  const handleAddToCart = async (food: Food, size: string) => {
    try {
      if (!size) {
        toast.error("Please select a size");
        return;
      }

      await addToCart(food.id, size, 1, {
        name: food.name,
        image_urls: food.image_urls,
        sizes: food.sizes,
      });
      setIsCartOpen(true); // Ensure CartSidebar opens
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#222]">
      <style jsx>{`
        input[type="checkbox"]:checked {
          background-color: #d7a95f;
          border-color: #d7a95f;
        }
        input[type="checkbox"]:focus {
          ring-color: #d7a95f;
        }
      `}</style>
      {isLoading && foods.length === 0 ? (
        <SkeletonLoader layout="ordersTab" />
      ) : (
        <section className="relative w-full py-12 pt-[10rem] sm:pt-[14rem]">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#d7a95f] text-center mb-8 stallion__font">
              Our Menu
            </h1>
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => {
                  setActiveType("fast_food");
                  setActiveCategory("");
                }}
                className={`block px-6 py-3 rounded-md text-md font-bold res__font transition-all duration-300 w-36 text-center ${
                  activeType === "fast_food"
                    ? "bg-[#d7a95f] text-white"
                    : "bg-[#333] text-[#d7a95f] border border-[#d7a95f] hover:bg-[#d7a95f] hover:text-white"
                }`}
              >
                Fast Food
              </button>
              <button
                onClick={() => {
                  setActiveType("fried_food");
                  setActiveCategory("");
                }}
                className={`block px-6 py-3 rounded-md text-md font-bold res__font transition-all duration-300 w-36 text-center ${
                  activeType === "fried_food"
                    ? "bg-[#d7a95f] text-white"
                    : "bg-[#333] text-[#d7a95f] border border-[#d7a95f] hover:bg-[#d7a95f] hover:text-white"
                }`}
              >
                Fried Food
              </button>
            </div>
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setActiveCategory(
                      category === activeCategory ? "" : category
                    )
                  }
                  className={`nav-link px-3 py-1 text-md font-medium res__font transition-all duration-300 ${
                    activeCategory === category
                      ? "active text-[#d7a95f]"
                      : "text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {Object.keys(groupedFoods).length === 0 ? (
              <p className="text-lg sm:text-xl text-white text-center res__font">
                No menu items found.
              </p>
            ) : (
              Object.entries(groupedFoods).map(([category, items]) => (
                <div key={category} className="mb-12">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-6 stallion__font">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((food) => {
                      const cartItem = cartItems.find(
                        (item) =>
                          item.food_id === food.id &&
                          item.size === selectedSizes[food.id]
                      );
                      const selectedSize = food.sizes.find(
                        (s) => s.size === selectedSizes[food.id]
                      );
                      return (
                        <div
                          key={food.id}
                          className="bg-black/80 border-2 border-[#d7a95f] rounded-lg shadow-md flex flex-col overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                          onClick={() => openModal(food)}
                        >
                          {food.image_urls.length > 0 ? (
                            <div className="w-full h-48 sm:h-64 md:h-72 relative">
                              <Image
                                src={food.image_urls[0]}
                                alt={food.name}
                                fill
                                className="object-cover rounded-t-lg"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority={true}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-48 sm:h-64 md:h-72 bg-[#333] flex items-center justify-center rounded-t-lg">
                              <p className="text-white res__font">No Image</p>
                            </div>
                          )}
                          <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                              {food.name}
                            </h3>
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-2">
                                {food.sizes.map((size) => (
                                  <label
                                    key={size.size}
                                    className="flex items-center gap-2 res__font cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSizeSelect(food.id, size.size);
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        selectedSizes[food.id] === size.size
                                      }
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleSizeSelect(food.id, size.size);
                                      }}
                                      className="form-checkbox h-5 w-5 text-[#d7a95f] border-[#d7a95f] focus:ring-[#d7a95f]"
                                    />
                                    <span className="text-white">
                                      {size.size}
                                    </span>
                                  </label>
                                ))}
                              </div>
                              {selectedSize && (
                                <p className="text-sm sm:text-md text-white res__font mt-2">
                                  Price: Rs {selectedSize.price}
                                  {selectedSize.cutPrice &&
                                  selectedSize.cutPrice > selectedSize.price ? (
                                    <span className="ml-2 text-[#d7a95f] text-sm">
                                      (Was Rs {selectedSize.cutPrice},{" "}
                                      {
                                        calculateDiscount(
                                          selectedSize.price,
                                          selectedSize.cutPrice
                                        ).percentOff
                                      }
                                      % off, Save Rs{" "}
                                      {
                                        calculateDiscount(
                                          selectedSize.price,
                                          selectedSize.cutPrice
                                        ).savePrice
                                      }
                                      )
                                    </span>
                                  ) : null}
                                </p>
                              )}
                            </div>
                            {cartItem ? (
                              <div className="flex items-center border border-[#d7a95f] rounded-md mt-4 w-fit">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(
                                      cartItem.id,
                                      cartItem.quantity - 1
                                    );
                                  }}
                                  className="px-3 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded-l-md res__font"
                                  disabled={cartItem.quantity <= 1}
                                >
                                  −
                                </button>
                                <span className="px-4 py-1 text-white res__font">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(
                                      cartItem.id,
                                      cartItem.quantity + 1
                                    );
                                  }}
                                  className="px-3 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded-r-md res__font"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(
                                    food,
                                    selectedSizes[food.id]!
                                  );
                                }}
                                className="mt-4 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 w-full"
                                disabled={
                                  food.sizes.length === 0 ||
                                  !selectedSizes[food.id]
                                }
                              >
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        food={selectedFood}
      />
    </div>
  );
}
