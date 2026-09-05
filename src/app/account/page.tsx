"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import SkeletonLoader from "@/components/SkeletonLoader";
import toast from "react-hot-toast";

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

interface Address {
  id: string;
  address: string;
  created_at: string;
}

export default function Account() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true
  const [activeSection, setActiveSection] = useState<
    "details" | "orders" | "addresses"
  >("details");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>(
    {}
  );
  const [addresses, setAddresses] = useState<Address[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Load cached data immediately
        const cachedUserData = localStorage.getItem(`user_${user.id}`);
        const cachedOrders = localStorage.getItem(`orders_${user.id}`);
        const cachedOrderItems = localStorage.getItem(`orderItems_${user.id}`);
        const cachedAddresses = localStorage.getItem(`addresses_${user.id}`);

        if (cachedUserData) {
          setUserData(JSON.parse(cachedUserData));
        }
        if (cachedOrders) {
          setOrders(JSON.parse(cachedOrders));
        }
        if (cachedOrderItems) {
          setOrderItems(JSON.parse(cachedOrderItems));
        }
        if (cachedAddresses) {
          setAddresses(JSON.parse(cachedAddresses));
        }

        // If all cached data is available, skip loader
        if (
          cachedUserData &&
          cachedOrders &&
          cachedOrderItems &&
          cachedAddresses
        ) {
          setIsLoading(false);
        }

        // Fetch user data from Supabase
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        if (userError) throw userError;

        setUserData(userData);
        localStorage.setItem(`user_${user.id}`, JSON.stringify(userData));

        // Fetch orders and addresses
        await Promise.all([fetchOrders(user.id), fetchAddresses(user.id)]);
      } catch (error: any) {
        setError(error.message);
        toast.error(error.message || "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchOrders = async (userId: string) => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (ordersError) throw ordersError;

        setOrders(ordersData || []);
        localStorage.setItem(
          `orders_${userId}`,
          JSON.stringify(ordersData || [])
        );

        const orderIds = ordersData?.map((order: Order) => order.id) || [];
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
        if (itemsError) throw itemsError;

        const itemsByOrder: { [key: string]: OrderItem[] } = {};
        itemsData?.forEach((item: any) => {
          if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
          itemsByOrder[item.order_id].push({
            id: item.id,
            food_id: item.food_id,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            food: {
              name: item.food?.name || "Unknown",
              image_urls: item.food?.image_urls || [],
            },
          });
        });

        setOrderItems(itemsByOrder);
        localStorage.setItem(
          `orderItems_${userId}`,
          JSON.stringify(itemsByOrder)
        );
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        toast.error(error.message || "Failed to load orders");
      }
    };

    const fetchAddresses = async (userId: string) => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("id, address, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (ordersError) throw ordersError;

        setAddresses(ordersData || []);
        localStorage.setItem(
          `addresses_${userId}`,
          JSON.stringify(ordersData || [])
        );
      } catch (error: any) {
        console.error("Error fetching addresses:", error);
        toast.error(error.message || "Failed to load addresses");
      }
    };

    fetchUserData();

    // Set up real-time subscriptions
    let userChannel: any,
      ordersChannel: any,
      orderItemsChannel: any,
      addressesChannel: any;
    const setupSubscriptions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userChannel = supabase
          .channel("users-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "users" },
            () => fetchUserData()
          )
          .subscribe();

        ordersChannel = supabase
          .channel("orders-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            () => fetchOrders(user.id)
          )
          .subscribe();

        orderItemsChannel = supabase
          .channel("order_items-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "order_items" },
            () => fetchOrders(user.id)
          )
          .subscribe();

        addressesChannel = supabase
          .channel("addresses-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            () => fetchAddresses(user.id)
          )
          .subscribe();
      }
    };

    setupSubscriptions();

    return () => {
      if (userChannel) supabase.removeChannel(userChannel);
      if (ordersChannel) supabase.removeChannel(ordersChannel);
      if (orderItemsChannel) supabase.removeChannel(orderItemsChannel);
      if (addressesChannel) supabase.removeChannel(addressesChannel);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem(`user_${userData?.id}`);
      localStorage.removeItem(`orders_${userData?.id}`);
      localStorage.removeItem(`orderItems_${userData?.id}`);
      localStorage.removeItem(`addresses_${userData?.id}`);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  // Show loader only if no data is available
  if (
    isLoading &&
    !userData &&
    !orders.length &&
    !Object.keys(orderItems).length &&
    !addresses.length
  ) {
    return <SkeletonLoader layout="account" />;
  }

  return (
    <div className="min-h-screen bg-[#222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-[6rem] sm:pt-[10rem]">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white stallion__font text-center mb-8">
          Your Account
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-4 res__font">{error}</p>
        )}
        <div className="bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]">
          {userData?.image_url && (
            <div className="flex justify-center mb-6">
              <Image
                src={userData.image_url}
                alt="Profile"
                width={150}
                height={150}
                className="rounded-full border-4 border-[#d7a95f] shadow-md"
              />
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white res__font">
                First Name
              </label>
              <p className="mt-1 text-lg text-white res__font">
                {userData?.first_name || "Loading..."}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white res__font">
                Last Name
              </label>
              <p className="mt-1 text-lg text-white res__font">
                {userData?.last_name || "Loading..."}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white res__font">
                Phone Number
              </label>
              <p className="mt-1 text-lg text-white res__font">
                {userData?.phone_number || "Loading..."}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white res__font">
                Email
              </label>
              <p className="mt-1 text-lg text-white res__font">
                {userData?.email || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setActiveSection("orders")}
              className={`flex-1 py-2 text-md font-medium res__font rounded-md transition-all duration-300 ${
                activeSection === "orders"
                  ? "bg-[#d7a95f] text-white"
                  : "bg-[#333] text-[#d7a95f] hover:bg-[#b5894c] hover:text-white"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveSection("addresses")}
              className={`flex-1 py-2 text-md font-medium res__font rounded-md transition-all duration-300 ${
                activeSection === "addresses"
                  ? "bg-[#d7a95f] text-white"
                  : "bg-[#333] text-[#d7a95f] hover:bg-[#b5894c] hover:text-white"
              }`}
            >
              Addresses
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {activeSection === "orders" && (
          <div className="mt-8 bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-6 stallion__font">
              Your Orders
            </h3>
            {orders.length === 0 ? (
              <p className="text-lg sm:text-xl text-white text-center res__font">
                No orders found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]"
                  >
                    <h4 className="text-lg sm:text-xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                      Order #{order.order_number}
                    </h4>
                    <p className="text-md text-white res__font">
                      <strong>Status:</strong> {order.status}
                    </p>
                    <p className="text-md text-white res__font">
                      <strong>Ordered on:</strong>{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <h5 className="text-md font-semibold text-[#d7a95f] mt-4 stallion__font">
                      Items
                    </h5>
                    {(orderItems[order.id] || []).map((item) => (
                      <div key={item.id} className="flex gap-4 py-2">
                        <div className="w-16 h-16 flex-shrink-0 relative">
                          {item.food.image_urls.length > 0 ? (
                            <Image
                              src={item.food.image_urls[0]}
                              alt={item.food.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#333] flex items-center justify-center rounded-md">
                              <p className="text-white res__font text-xs">
                                No Image
                              </p>
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
                          <p className="text-sm text-white res__font">
                            {item.size}
                          </p>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "addresses" && (
          <div className="mt-8 bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-6 stallion__font">
              Your Addresses
            </h3>
            {addresses.length === 0 ? (
              <p className="text-lg sm:text-xl text-white text-center res__font">
                No addresses found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-black/80 p-6 rounded-lg shadow-md border-2 border-[#d7a95f]"
                  >
                    <p className="text-md text-white res__font">
                      {address.address}
                    </p>
                    <p className="text-sm text-gray-400 mt-2 res__font">
                      Added on: {new Date(address.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
