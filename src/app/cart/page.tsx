"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCart } from "../../hooks/useCart";
import { FaTrash } from "react-icons/fa";
import { useNavigation } from "../../components/NavigationProvider";
import { CartItem } from "../../components/types";

export default function CartPage() {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { navigate } = useNavigation();

  const handleImageError = (imageUrl: string): void => {
    setFailedImages((prev) => new Set([...prev, imageUrl]));
  };

  const handleQuantityChange = async (
    itemId: string,
    newQuantity: number
  ): Promise<void> => {
    if (newQuantity < 0) return;
    setLoadingItemId(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update quantity: ${message}`);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string): Promise<void> => {
    setLoadingItemId(itemId);
    try {
      await removeFromCart(itemId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to remove item: ${message}`);
    } finally {
      setLoadingItemId(null);
    }
  };

  const calculateSubtotal = (): number => {
    return cartItems.reduce((total: number, item: CartItem) => {
      const size = item.food.sizes.find((s) => s.size === item.size);
      if (!size) {
        console.warn(`Size ${item.size} not found for item ${item.food.name}`);
        return total;
      }
      return total + size.price * item.quantity;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-[#222] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[5.5rem] sm:pt-[10rem]">
        <h2 className="text-3xl sm:text-4xl font-semibold text-[#d7a95f] stallion__font mb-8 text-center">
          Your Cart
        </h2>
        <div className="bg-black/80 rounded-lg shadow-md border-2 border-[#d7a95f] p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
                alt="Logo"
                width={150}
                height={50}
                className="mb-4"
              />
              <p className="text-lg sm:text-xl text-white font-semibold res__font mb-2">
                Your cart is empty
              </p>
              <button
                onClick={() => navigate("/menus")}
                className="mt-4 py-2 px-6 bg-[#d7a95f] text-white rounded-md text-md font-semibold res__font hover:bg-[#b5894c] transition-all duration-300"
              >
                Browse Menus
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {cartItems.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 py-3 ${
                      loadingItemId === item.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="w-20 h-20 flex-shrink-0 relative">
                      {item.food.image_urls.length > 0 &&
                      !failedImages.has(item.food.image_urls[0]) ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${
                            item.food.image_urls[0]
                          }`}
                          alt={item.food.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-md"
                          onError={() =>
                            handleImageError(item.food.image_urls[0])
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-[#333] flex items-center justify-center rounded-md">
                          <p className="text-white res__font text-sm">
                            No Image
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-[#d7a95f] stallion__font">
                        {item.food.name}
                      </h3>
                      <p className="text-sm text-white res__font">
                        {item.size}
                      </p>
                      <p className="text-sm text-white res__font">
                        Rs{" "}
                        {item.food.sizes.find((s) => s.size === item.size)
                          ?.price || 0}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center border">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 text-[#d7a95f] hover:bg-[#b5894c] hover:text-white rounded-l-md res__font"
                            disabled={loadingItemId === item.id}
                          >
                            ▼
                          </button>
                          <span className="px-3 py-1 text-white res__font">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-[#d7a95f] hover:bg-[#b5894c] hover:text-white rounded-r-md res__font"
                            disabled={loadingItemId === item.id}
                          >
                            ▲
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#d7a95f] hover:text-[#b5894c] res__font"
                      disabled={loadingItemId === item.id}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              {loadingItemId && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="w-8 h-8 border-4 border-[#d7a95f] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="mt-6 border-t border-[#d7a95f] pt-4">
                <div className="flex justify-between text-md text-white res__font">
                  <span>Subtotal</span>
                  <span>Rs {calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between text-md font-semibold text-[#d7a95f] res__font mt-2">
                  <span>Total</span>
                  <span>Rs {calculateSubtotal()}</span>
                </div>
                <button
                  onClick={() => {
                    if (cartItems.length === 0) {
                      toast.error("Cart is empty");
                    } else if (!isCheckingOut) {
                      setIsCheckingOut(true);
                      navigate("/checkout");
                      setTimeout(() => setIsCheckingOut(false), 2000);
                    }
                  }}
                  className={`w-full py-2 mt-4 bg-[#d7a95f] text-white rounded-md text-md font-semibold res__font hover:bg-[#b5894c] transition-all duration-300 text-center ${
                    isCheckingOut || cartItems.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isCheckingOut || cartItems.length === 0}
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
