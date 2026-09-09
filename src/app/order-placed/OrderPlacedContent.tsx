// app/order-placed/OrderPlacedContent.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { useNavigation } from "../../components/NavigationProvider";
import { Order, OrderItem } from "../../components/types";

export default function OrderPlacedContent() {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId");
  const sessionId = searchParams?.get("sessionId");
  const { navigate } = useNavigation();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        const userId = user?.id;

        let query = supabase.from("orders").select("*").eq("id", orderId);

        if (!userId && sessionId) {
          query = query.eq("session_id", sessionId);
        } else if (userId) {
          query = query.eq("user_id", userId);
        } else {
          throw new Error("Unauthorized access: No user or session ID");
        }

        const { data: orderData, error: orderError } = await query.single();
        if (orderError || !orderData) {
          throw new Error(orderError?.message || "Order not found");
        }

        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select(
            `
            id,
            order_id,
            food_id,
            size,
            quantity,
            price,
            food:foods (
              name,
              image_urls
            )
          `
          )
          .eq("order_id", orderId);

        if (itemsError) {
          throw new Error(`Failed to fetch order items: ${itemsError.message}`);
        }

        setOrder(orderData);
        setOrderItems(
          itemsData.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            food_id: item.food_id,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            food: {
              name: item.food?.name || "Unknown",
              image_urls: Array.isArray(item.food?.image_urls)
                ? item.food.image_urls
                : [],
            },
          }))
        );
      } catch (error: any) {
        console.error("Error fetching order:", error);
        const errorMessage = error.message || "Failed to load order details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, sessionId]);

  const handleImageError = (imageUrl: string) => {
    setFailedImages((prev) => new Set([...prev, imageUrl]));
  };

  const orderTotal = useMemo(() => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [orderItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#222] flex items-center justify-center">
        <div
          className="w-12 h-12 border-4 border-[#d7a95f] border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading order details"
        />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#222] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 res__font mb-4">
            {error || "Order not found"}
          </p>
          <button
            onClick={() => navigate("/")} // Navigate to home, with loading animation
            className="text-[#d7a95f] underline res__font hover:text-white transition-all duration-300"
            aria-label="Return to Home"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-[5.5rem] sm:pt-[10rem]">
        <h2 className="text-3xl sm:text-5xl font-semibold text-[#d7a95f] stallion__font text-center mb-5">
          Thank You, {order.first_name} {order.last_name}!
        </h2>
        <p className="text-lg text-white res__font text-center mb-7">
          Your order has been placed successfully.
        </p>
        <div>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/separator.svg`}
            alt="Separator"
            width={150}
            height={20}
            className="w-[150px] mx-auto relative z-10 mb-7"
          />
        </div>
        <div className="bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]">
          <h3 className="text-xl font-semibold text-[#d7a95f] stallion__font mb-6">
            Order Details
          </h3>
          <div className="space-y-4">
            <p className="text-md text-white res__font">
              <strong>Order Number:</strong> {order.order_number}
            </p>
            <p className="text-md text-white res__font">
              <strong>Name:</strong> {order.first_name} {order.last_name}
            </p>
            <p className="text-md text-white res__font">
              <strong>Phone Number:</strong> {order.phone_number}
            </p>
            <p className="text-md text-white res__font">
              <strong>Email:</strong> {order.email}
            </p>
            <p className="text-md text-white res__font">
              <strong>Address:</strong> {order.address}
            </p>
            <p className="text-md text-white res__font">
              <strong>Payment Method:</strong> {order.payment_method}
            </p>
            <p className="text-md text-white res__font">
              <strong>Order Date:</strong>{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>
            <h4 className="text-lg font-semibold text-[#d7a95f] stallion__font mt-6">
              Order Items
            </h4>
            <ul role="list" className="space-y-4">
              {orderItems.map((item) => (
                <li key={item.id} className="flex gap-4 py-2" role="listitem">
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
                        <p className="text-white res__font text-sm">No Image</p>
                      </div>
                    )}
                    <span
                      className="absolute top-0 right-0 bg-black text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center border border-[#d7a95f]"
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-md font-semibold text-[#d7a95f] stallion__font">
                      {item.food.name}
                    </h4>
                    <p className="text-sm text-white res__font">{item.size}</p>
                    <p className="text-sm text-white res__font">
                      Rs {item.price} x {item.quantity} = Rs{" "}
                      {item.price * item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-[#d7a95f] pt-4">
              <div className="flex justify-between text-md text-white res__font">
                <span>Subtotal</span>
                <span>Rs {order.subtotal}</span>
              </div>
              <div className="flex justify-between text-md text-white res__font mt-2">
                <span>Delivery Charges</span>
                <span>Rs {order.delivery_charges}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-md text-white res__font mt-2">
                  <span>Discount</span>
                  <span>-Rs {order.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-md font-semibold text-[#d7a95f] res__font mt-2">
                <span>Total</span>
                <span>Rs {order.total}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate("/contact")} // Navigate to contact, no loading animation
              className="flex-1 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 text-center"
              aria-label="Contact Us for Help"
            >
              Need Help? Contact Us
            </button>
            <button
              onClick={() => navigate("/menus")} // Navigate to menus, no loading animation
              className="flex-1 py-2 bg-[#333] text-[#d7a95f] border border-[#d7a95f] rounded-md text-md font-medium res__font hover:bg-[#d7a95f] hover:text-white transition-all duration-300 text-center"
              aria-label="Continue Shopping"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
