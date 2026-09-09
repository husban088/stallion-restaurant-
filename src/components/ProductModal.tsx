"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import ReactHtmlParser from "react-html-parser";
import { useCart } from "../hooks/useCart";
import toast from "react-hot-toast";
import { CartItem } from "../components/types";

interface Food {
  id: string;
  type: "fast_food" | "fried_food";
  categories: string[];
  name: string;
  description: string;
  sizes: { size: string; price: number; cutPrice?: number }[];
  image_urls: string[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: Food | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  food,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    if (food && food.sizes.length > 0) {
      setSelectedSize(food.sizes[0].size);
      setQuantity(1);
      setFailedImage(null);
    }
  }, [food]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const calculateDiscount = (price: number, cutPrice?: number) => {
    if (!cutPrice || cutPrice <= price || price <= 0)
      return { percentOff: 0, savePrice: 0 };
    const discount = cutPrice - price;
    const percentOff = Math.round((discount / cutPrice) * 100);
    return { percentOff, savePrice: discount };
  };

  const calculateTotalPrice = () => {
    if (!food || !selectedSize) return 0;
    const size = food.sizes.find((s) => s.size === selectedSize);
    return quantity * (size?.price || 0);
  };

  const handleAddToCart = async () => {
    if (!food || !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    try {
      const cartFood: CartItem["food"] = {
        name: food.name,
        image_urls: food.image_urls,
        sizes: food.sizes,
      };
      await addToCart(food.id, selectedSize, quantity, cartFood);
      setIsCartOpen(true); // Ensure CartSidebar opens
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add item to cart");
    }
  };

  const handleImageError = () => {
    if (food?.image_urls[0]) {
      setFailedImage(food.image_urls[0]);
    }
  };

  if (!isOpen || !food) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <style jsx>{`
        input[type="checkbox"]:checked {
          background-color: #d7a95f;
          border-color: #d7a95f;
        }
        input[type="checkbox"]:focus {
          ring-color: #d7a95f;
        }
      `}</style>
      <div
        ref={modalRef}
        className="bg-black/80 p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-100 opacity-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#d7a95f] text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#b5894c] text-xl res__font"
        >
          ×
        </button>
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-5">
          {food.image_urls.length > 0 && !failedImage ? (
            <div className="w-full h-48 sm:h-64 md:h-80 mb-4">
              <Image
                src={food.image_urls[0]}
                alt={food.name}
                width={500}
                height={300}
                className="w-full h-full object-cover rounded-md"
                onError={handleImageError}
                priority
              />
            </div>
          ) : (
            <div className="w-full h-48 sm:h-64 md:h-80 bg-[#333] flex items-center justify-center mb-4 rounded-md">
              <p className="text-white res__font">No Image</p>
            </div>
          )}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] stallion__font">
              {food.name}
            </h2>
            <p className="text-md sm:text-lg text-white res__font">
              Type: {food.type === "fast_food" ? "Fast Food" : "Fried Food"}
            </p>
            <p className="text-md sm:text-lg text-white res__font">
              Category: {food.categories.join(", ")}
            </p>
            <div className="text-md sm:text-lg text-white res__font">
              {ReactHtmlParser(DOMPurify.sanitize(food.description))}
            </div>
            <div>
              <label className="block text-sm font-medium text-white res__font">
                Size
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {food.sizes.map((size) => (
                  <label
                    key={size.size}
                    className="flex items-center gap-2 res__font cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSize === size.size}
                      onChange={() => setSelectedSize(size.size)}
                      className="form-checkbox h-5 w-5 text-[#d7a95f] border-[#d7a95f] focus:ring-[#d7a95f]"
                    />
                    <span className="text-white">
                      {size.size}: Rs {size.price}
                      {size.cutPrice && size.cutPrice > size.price ? (
                        <span className="ml-2 text-[#d7a95f] text-sm">
                          (Was Rs {size.cutPrice},{" "}
                          {
                            calculateDiscount(size.price, size.cutPrice)
                              .percentOff
                          }
                          % off, Save Rs{" "}
                          {
                            calculateDiscount(size.price, size.cutPrice)
                              .savePrice
                          }
                          )
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-black/80 pt-4 pb-2 border-t border-[#d7a95f]">
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-[#d7a95f] rounded-md">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded-l-md res__font"
              >
                −
              </button>
              <span className="px-4 py-1 text-white res__font">{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded-r-md res__font"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={food.sizes.length === 0 || !selectedSize}
            >
              <span>Add to Cart</span>
              {selectedSize && (
                <span className="text-sm">(Rs {calculateTotalPrice()})</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
