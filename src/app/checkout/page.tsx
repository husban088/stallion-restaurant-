// app/checkout/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { useCartStore } from "../../lib/cartStore"; // Replaced useCart with useCartStore
import { v4 as uuidv4 } from "uuid";
import { CartItem } from "../../components/types";
import { useNavigation } from "../../components/NavigationProvider";

export default function Checkout() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { cartItems, clearCart, isLoading } = useCartStore(); // Updated to useCartStore
  const { navigate } = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          console.error("Failed to fetch user:", userError);
          return;
        }
        if (user) {
          setFormData({
            firstName: user.user_metadata?.first_name || "",
            lastName: user.user_metadata?.last_name || "",
            phoneNumber: user.user_metadata?.phone_number || "",
            email: user.email || "",
            address: "",
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching user data:", err);
        toast.error(
          "Failed to load user data. Please fill in the form manually."
        );
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateSubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price =
        item.food.sizes.find((s) => s.size === item.size)?.price || 0;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const deliveryCharges = 100;
  const discountAmount = discountApplied ? 250 : 0;
  const total = calculateSubtotal + deliveryCharges - discountAmount;

  const handleApplyDiscount = async () => {
    if (discountCode === "STALLIONRESTURANT25") {
      setDiscountApplied(true);
      toast.success("Discount of Rs 250 applied!");
    } else {
      toast.error("Invalid discount code");
    }
  };

  const handleImageError = (imageUrl: string) => {
    setFailedImages((prev) => new Set(prev).add(imageUrl));
  };

  const handlePlaceOrder = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.address
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^\+?\d{10,15}$/.test(formData.phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user.user?.id || null;
      const sessionId = userId ? null : uuidv4();

      const { data: orderNumberData, error: orderNumberError } =
        await supabase.rpc("generate_order_number");
      if (orderNumberError) {
        throw new Error("Failed to generate order number");
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            order_number: orderNumberData,
            user_id: userId,
            session_id: sessionId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
            email: formData.email,
            address: formData.address,
            payment_method: paymentMethod,
            subtotal: calculateSubtotal,
            delivery_charges: deliveryCharges,
            discount_amount: discountAmount,
            total: total,
            status: "Pending",
          },
        ])
        .select()
        .single();
      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      const orderItems = cartItems.map((item: CartItem) => ({
        order_id: order.id,
        food_id: item.food_id,
        size: item.size,
        quantity: item.quantity,
        price: item.food.sizes.find((s) => s.size === item.size)?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) {
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      await clearCart();
      toast.success("Your order is placed!");
      navigate(
        `/order-placed?orderId=${order.id}${
          sessionId ? `&sessionId=${sessionId}` : ""
        }`
      ); // Navigate to order-placed, no loading animation
    } catch (error: any) {
      console.error("Order placement error:", error);
      const errorMessage =
        error.message || "Failed to place order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.phoneNumber &&
    formData.email &&
    formData.address &&
    cartItems.length > 0;

  return (
    <div className="min-h-screen bg-[#222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-[5.5rem] sm:pt-[10rem]">
        <h2 className="text-3xl sm:text-5xl font-semibold text-[#d7a95f] stallion__font text-center mb-5">
          Checkout
        </h2>
        <div>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/separator.svg`}
            alt="Separator"
            width={150}
            height={20}
            className="w-[150px] mx-auto relative z-10 mb-7"
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#d7a95f] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]">
              <h3 className="text-xl font-semibold text-[#d7a95f] stallion__font mb-6">
                Billing Details
              </h3>
              {error && (
                <p className="text-red-500 text-center mb-4 res__font">
                  {error}
                </p>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white res__font">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 bg-[#333] text-white rounded-md border border-[#d7a95f] focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white res__font">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 bg-[#333] text-white rounded-md border border-[#d7a95f] focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white res__font">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 bg-[#333] text-white rounded-md border border-[#d7a95f] focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white res__font">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 bg-[#333] text-white rounded-md border border-[#d7a95f] focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white res__font">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 bg-[#333] text-white rounded-md border border-[#d7a95f] focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-white res__font">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#333] text-white rounded-md border border-[#d7a95f] focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>
            </div>
            <div className="bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]">
              <h3 className="text-xl font-semibold text-[#d7a95f] stallion__font mb-6">
                Your Cart
              </h3>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
                    alt="Logo"
                    width={120}
                    height={40}
                    className="mb-4"
                  />
                  <p className="text-lg text-white res__font">
                    Your cart is empty
                  </p>
                </div>
              ) : (
                <>
                  {cartItems.map((item: CartItem) => (
                    <div key={item.id} className="flex gap-4 py-2">
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
                        <span className="absolute top-0 right-0 bg-black text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center border border-[#d7a95f]">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-md font-semibold text-[#d7a95f] stallion__font">
                          {item.food.name}
                        </h4>
                        <p className="text-sm text-white res__font">
                          {item.size}
                        </p>
                        <p className="text-sm text-white res__font">
                          Rs{" "}
                          {item.food.sizes.find((s) => s.size === item.size)
                            ?.price || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter discount code"
                      className="w-full px-3 py-2 bg-[#333] text-white rounded-md border border-[#d7a95f] focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                    />
                    <button
                      onClick={handleApplyDiscount}
                      className="px-4 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="mt-6 border-t border-[#d7a95f] pt-4">
                    <div className="flex justify-between text-md text-white res__font">
                      <span>Subtotal</span>
                      <span>Rs {calculateSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-md text-white res__font mt-2">
                      <span>Delivery Charges</span>
                      <span>Rs {deliveryCharges}</span>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between text-md text-white res__font mt-2">
                        <span>Discount</span>
                        <span>-Rs {discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-md font-semibold text-[#d7a95f] res__font mt-2">
                      <span>Total</span>
                      <span>Rs {total}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-2 mt-4 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isFormValid || isSubmitting || isLoading}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
