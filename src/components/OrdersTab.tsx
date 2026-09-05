// components/OrdersTab.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
  FaMoneyBillWave,
} from "react-icons/fa";
import SkeletonLoader from "@/components/SkeletonLoader";

interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  address: string;
  payment_method: string;
  subtotal: number;
  delivery_charges: number;
  discount_amount: number;
  total: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  food_id: string;
  size: string;
  quantity: number;
  price: number;
  food: {
    name: string;
    image_urls: string[];
  };
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{
    [key: string]: string | null;
  }>({});
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [filters, setFilters] = useState({
    name: "",
    orderNumber: "",
    email: "",
    phoneNumber: "",
    date: "",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          toast.error("Please log in to view orders");
          setError("Authentication required");
          return;
        }

        // Preload cached data
        const cachedOrders = localStorage.getItem("all_orders");
        const cachedOrderItems = localStorage.getItem("all_order_items");
        if (cachedOrders) {
          setOrders(JSON.parse(cachedOrders));
          setFilteredOrders(JSON.parse(cachedOrders));
          setIsLoading(false);
        }
        if (cachedOrderItems) {
          setOrderItems(JSON.parse(cachedOrderItems));
        }

        // Fetch from Supabase
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (ordersError)
          throw new Error(`Failed to fetch orders: ${ordersError.message}`);

        const orderIds = ordersData.map((order: Order) => order.id);
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
          .in("order_id", orderIds);
        if (itemsError)
          throw new Error(`Failed to fetch order items: ${itemsError.message}`);

        const itemsByOrder: { [key: string]: OrderItem[] } = {};
        itemsData.forEach((item: any) => {
          if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
          itemsByOrder[item.order_id].push({
            id: item.id,
            food_id: item.food_id,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            food: {
              name: item.food.name || "Unknown",
              image_urls: item.food.image_urls || [],
            },
          });
        });

        const initialEarnings = ordersData
          .filter((order: Order) => order.status === "Delivered")
          .reduce((sum: number, order: Order) => sum + (order.total || 0), 0);

        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setOrderItems(itemsByOrder);
        setTotalEarnings(initialEarnings);
        localStorage.setItem("all_orders", JSON.stringify(ordersData));
        localStorage.setItem("all_order_items", JSON.stringify(itemsByOrder));
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setError(error.message || "Failed to load orders");
        toast.error(error.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          console.log("Real-time orders update triggered");
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let result = [...orders];

      if (filters.name) {
        const nameLower = filters.name.toLowerCase();
        result = result.filter(
          (order) =>
            order.first_name.toLowerCase().includes(nameLower) ||
            order.last_name.toLowerCase().includes(nameLower)
        );
      }

      if (filters.orderNumber) {
        const orderNumberLower = filters.orderNumber.toLowerCase();
        result = result.filter((order) =>
          order.order_number.toLowerCase().includes(orderNumberLower)
        );
      }

      if (filters.email) {
        const emailLower = filters.email.toLowerCase();
        result = result.filter((order) =>
          order.email.toLowerCase().includes(emailLower)
        );
      }

      if (filters.phoneNumber) {
        const phoneNumberClean = filters.phoneNumber.replace(/\D/g, "");
        result = result.filter((order) =>
          order.phone_number.replace(/\D/g, "").includes(phoneNumberClean)
        );
      }

      if (filters.date) {
        const selectedDate = new Date(filters.date).toISOString().split("T")[0];
        result = result.filter((order) => {
          const orderDate = new Date(order.created_at)
            .toISOString()
            .split("T")[0];
          return orderDate === selectedDate;
        });
      }

      setFilteredOrders(result);
    };

    applyFilters();
  }, [filters, orders]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof filters
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: "Pending" | "Delivered"
  ) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: newStatus }));
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);
      if (error)
        throw new Error(`Failed to update order status: ${error.message}`);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setFilteredOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setTotalEarnings((prev) =>
          newStatus === "Delivered" ? prev + order.total : prev - order.total
        );
      }

      toast.success(`Order marked as ${newStatus}`);
    } catch (error: any) {
      console.error("Status update error:", error);
      toast.error(
        error.message || "Failed to update order status. Please try again."
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  const handleImageError = (imageUrl: string) => {
    setFailedImages((prev) => new Set(prev).add(imageUrl));
  };

  const deliveredOrders = filteredOrders.filter(
    (order) => order.status === "Delivered"
  ).length;
  const pendingOrders = filteredOrders.filter(
    (order) => order.status === "Pending"
  ).length;
  const totalOrders = filteredOrders.length;

  if (isLoading && !orders.length && !Object.keys(orderItems).length) {
    return <SkeletonLoader layout="ordersTab" />;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-lg sm:text-xl text-red-500 res__font">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-black/80 p-6 rounded-lg shadow-md">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] text-center mb-6 stallion__font">
          Filter Orders
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="name-filter"
              className="block text-sm font-medium text-white res__font"
            >
              Customer Name
            </label>
            <input
              id="name-filter"
              type="text"
              value={filters.name}
              onChange={(e) => handleFilterChange(e, "name")}
              placeholder="Enter first or last name"
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
              aria-label="Filter by customer first or last name"
            />
          </div>
          <div>
            <label
              htmlFor="order-number-filter"
              className="block text-sm font-medium text-white res__font"
            >
              Order Number
            </label>
            <input
              id="order-number-filter"
              type="text"
              value={filters.orderNumber}
              onChange={(e) => handleFilterChange(e, "orderNumber")}
              placeholder="Enter order number"
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
              aria-label="Filter by order number"
            />
          </div>
          <div>
            <label
              htmlFor="email-filter"
              className="block text-sm font-medium text-white res__font"
            >
              Email
            </label>
            <input
              id="email-filter"
              type="email"
              value={filters.email}
              onChange={(e) => handleFilterChange(e, "email")}
              placeholder="Enter email"
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
              aria-label="Filter by email"
            />
          </div>
          <div>
            <label
              htmlFor="phone-number-filter"
              className="block text-sm font-medium text-white res__font"
            >
              Phone Number
            </label>
            <input
              id="phone-number-filter"
              type="text"
              value={filters.phoneNumber}
              onChange={(e) => handleFilterChange(e, "phoneNumber")}
              placeholder="Enter phone number"
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
              aria-label="Filter by phone number"
            />
          </div>
          <div>
            <label
              htmlFor="date-filter"
              className="block text-sm font-medium text-white res__font"
            >
              Order Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange(e, "date")}
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
              aria-label="Filter by order date"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a1a] p-4 rounded-lg border-2 border-[#d7a95f] flex items-center">
          <FaCheckCircle className="text-[#d7a95f] text-3xl mr-4" />
          <div>
            <p className="text-sm text-white res__font">Delivered Orders</p>
            <p className="text-2xl font-bold text-[#d7a95f] stallion__font">
              {deliveredOrders}
            </p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-lg border-2 border-[#d7a95f] flex items-center">
          <FaClock className="text-[#d7a95f] text-3xl mr-4" />
          <div>
            <p className="text-sm text-white res__font">Pending Orders</p>
            <p className="text-2xl font-bold text-[#d7a95f] stallion__font">
              {pendingOrders}
            </p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-lg border-2 border-[#d7a95f] flex items-center">
          <FaBoxOpen className="text-[#d7a95f] text-3xl mr-4" />
          <div>
            <p className="text-sm text-white res__font">Total Orders</p>
            <p className="text-2xl font-bold text-[#d7a95f] stallion__font">
              {totalOrders}
            </p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-lg border-2 border-[#d7a95f] flex items-center">
          <FaMoneyBillWave className="text-[#d7a95f] text-3xl mr-4" />
          <div>
            <p className="text-sm text-white res__font">Total Earnings</p>
            <p className="text-2xl font-bold text-[#d7a95f] stallion__font">
              Rs {totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] text-center mb-8 stallion__font">
        Orders
      </h2>
      {filteredOrders.length === 0 ? (
        <p className="text-lg sm:text-xl text-white text-center res__font">
          No orders found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]"
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                Order #{order.order_number}
              </h3>
              <p className="text-md text-white res__font">
                <strong>Customer:</strong> {order.first_name} {order.last_name}
              </p>
              <p className="text-md text-white res__font">
                <strong>Email:</strong> {order.email}
              </p>
              <p className="text-md text-white res__font">
                <strong>Phone:</strong> {order.phone_number}
              </p>
              <p className="text-md text-white res__font">
                <strong>Address:</strong> {order.address}
              </p>
              <p className="text-md text-white res__font">
                <strong>Payment:</strong> {order.payment_method}
              </p>
              <p className="text-md text-white res__font">
                <strong>Status:</strong> {order.status}
              </p>
              <p className="text-sm text-gray-400 mt-2 res__font">
                Ordered on: {new Date(order.created_at).toLocaleString()}
              </p>
              <h4 className="text-lg font-semibold text-[#d7a95f] stallion__font mt-4">
                Items
              </h4>
              {(orderItems[order.id] || []).map((item) => (
                <div key={item.id} className="flex gap-4 py-2">
                  <div className="w-16 h-16 flex-shrink-0 relative">
                    {item.food.image_urls.length > 0 &&
                    !failedImages.has(item.food.image_urls[0]) ? (
                      <Image
                        src={item.food.image_urls[0]}
                        alt={item.food.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-md"
                        onError={() =>
                          handleImageError(item.food.image_urls[0])
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-[#333] flex items-center justify-center rounded-md">
                        <p className="text-white res__font text-xs">No Image</p>
                      </div>
                    )}
                    <span className="absolute top-0 right-0 bg-black text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center border border-[#d7a95f]">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-md text-white res__font">
                      {item.food.name}
                    </p>
                    <p className="text-sm text-white res__font">{item.size}</p>
                    <p className="text-sm text-white res__font">
                      Rs {item.price} x {item.quantity} = Rs{" "}
                      {item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
              <div className="mt-4 border-t border-[#d7a95f] pt-4">
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
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleStatusUpdate(order.id, "Delivered")}
                  className="flex-1 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={
                    updatingStatus[order.id] === "Delivered" ||
                    updatingStatus[order.id] === "Pending"
                  }
                  aria-label={`Mark order ${order.order_number} as Delivered`}
                >
                  {updatingStatus[order.id] === "Delivered" ? (
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
                      Updating...
                    </>
                  ) : (
                    "Mark Delivered"
                  )}
                </button>
                <button
                  onClick={() => handleStatusUpdate(order.id, "Pending")}
                  className="flex-1 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={
                    updatingStatus[order.id] === "Pending" ||
                    updatingStatus[order.id] === "Delivered"
                  }
                  aria-label={`Mark order ${order.order_number} as Pending`}
                >
                  {updatingStatus[order.id] === "Pending" ? (
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
                      Updating...
                    </>
                  ) : (
                    "Mark Pending"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
