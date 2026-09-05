"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCart } from "../hooks/useCart";
import { FaTrash } from "react-icons/fa";
import { useNavigation } from "./NavigationProvider";

interface CartSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CartSidebar({ isOpen, setIsOpen }: CartSidebarProps) {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { navigate } = useNavigation();

  // Handle image loading errors
  const handleImageError = (imageUrl: string): void => {
    setFailedImages((prev) => new Set(prev).add(imageUrl));
  };

  // Handle clicks outside the sidebar to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Ignore clicks on buttons or toast notifications
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        !(target instanceof HTMLElement && target.closest(".Toastify"))
      ) {
        console.log("Closing CartSidebar due to outside click");
        setIsOpen(false);
      } else {
        console.log("Click inside CartSidebar or on toast, not closing");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent scrolling when open
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto"; // Restore scrolling when closed
    };
  }, [isOpen, setIsOpen]);

  // Handle quantity changes (increment/decrement)
  const handleQuantityChange = async (
    event: React.MouseEvent<HTMLButtonElement>,
    itemId: string,
    newQuantity: number
  ) => {
    event.stopPropagation(); // Prevent click from closing sidebar
    console.log(`Updating quantity for item ${itemId} to ${newQuantity}`);
    if (newQuantity < 0) return;
    setLoadingItemId(itemId);
    try {
      if (newQuantity === 0) {
        await removeFromCart(itemId);
      } else {
        await updateQuantity(itemId, newQuantity);
      }
    } catch (error: any) {
      toast.error(
        `Failed to update quantity: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoadingItemId(null);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (
    event: React.MouseEvent<HTMLButtonElement>,
    itemId: string
  ) => {
    event.stopPropagation(); // Prevent click from closing sidebar
    console.log(`Removing item ${itemId}`);
    setLoadingItemId(itemId);
    try {
      await removeFromCart(itemId);
    } catch (error: any) {
      toast.error(`Failed to remove item: ${error.message || "Unknown error"}`);
    } finally {
      setLoadingItemId(null);
    }
  };

  // Calculate subtotal
  const calculateSubtotal = (): number => {
    return cartItems.reduce((total, item) => {
      const size = item.food.sizes.find((s) => s.size === item.size);
      if (!size) {
        console.warn(`Size ${item.size} not found for item ${item.food.name}`);
        return total;
      }
      return total + size.price * item.quantity;
    }, 0);
  };

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-[80%] sm:w-[450px] bg-black text-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-all duration-500 ease-in-out z-[60] flex flex-col custom-scrollbar`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent clicks inside sidebar from closing it
          console.log("Clicked inside CartSidebar");
        }}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b border-[#d7a95f] sticky top-0 bg-black">
          <h2 className="text-xl font-semibold text-[#d7a95f] stallion__font">
            Your Cart
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Closing CartSidebar via close button");
              setIsOpen(false);
            }}
            className="text-white hover:text-[#d7a95f] focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 relative custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
                alt="Logo"
                width={120}
                height={40}
                className="mb-4"
              />
              <p className="text-lg text-white res__font">Your cart is empty</p>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-4 py-2 ${
                    loadingItemId === item.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="w-20 h-20 flex-shrink-0">
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
                        <p className="text-white res__font text-sm">No Image</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-md font-semibold text-[#d7a95f] stallion__font">
                      {item.food.name}
                    </h3>
                    <p className="text-sm text-white res__font">{item.size}</p>
                    <p className="text-sm text-white res__font">
                      Rs{" "}
                      {item.food.sizes.find((s) => s.size === item.size)
                        ?.price || 0}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border border-[#d7a95f] rounded-md">
                        <button
                          onClick={(e) =>
                            handleQuantityChange(e, item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded-l-md res__font"
                          disabled={
                            loadingItemId === item.id || item.quantity <= 0
                          }
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-white res__font">
                          {item.quantity}
                        </span>
                        <button
                          onClick={(e) =>
                            handleQuantityChange(e, item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded-r-md res__font"
                          disabled={loadingItemId === item.id}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemoveItem(e, item.id)}
                    className="text-[#d7a95f] hover:text-[#b5894c] res__font"
                    disabled={loadingItemId === item.id}
                    title="Remove item"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              {loadingItemId && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="w-8 h-8 border-4 border-[#d7a95f] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="px-4 py-4 border-t border-[#d7a95f] sticky bottom-0 bg-black">
            <div className="flex justify-between text-md text-white res__font">
              <span>Subtotal</span>
              <span>Rs {calculateSubtotal()}</span>
            </div>
            <div className="flex justify-between text-md font-semibold text-[#d7a95f] res__font mt-2">
              <span>Total</span>
              <span>Rs {calculateSubtotal()}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Navigating to /cart");
                  setIsOpen(false);
                  navigate("/cart");
                }}
                className="flex-1 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 text-center"
              >
                View Cart
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Attempting checkout");
                  if (cartItems.length === 0) {
                    toast.error("Cart is empty");
                  } else if (!isCheckingOut) {
                    setIsCheckingOut(true);
                    navigate("/checkout");
                    setIsOpen(false);
                    setTimeout(() => setIsCheckingOut(false), 2000);
                  }
                }}
                className={`flex-1 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 text-center ${
                  isCheckingOut || cartItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={isCheckingOut || cartItems.length === 0}
              >
                {isCheckingOut ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]"
          onClick={() => {
            console.log("Clicked outside CartSidebar");
            setIsOpen(false);
          }}
        ></div>
      )}
    </>
  );
}
