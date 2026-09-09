"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface Booking {
  id: string;
  name: string;
  mobile_number: string;
  persons: number;
  booking_date: string;
  booking_time: string;
  message?: string;
  created_at: string;
}

export default function MyOrders() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          toast.error("Please log in to view your orders");
          return;
        }

        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        toast.error("Failed to fetch orders. Please try again.");
        console.error(error);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative w-full bg-[#222] py-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#d7a95f] text-center mb-8 stallion__font">
            My Orders
          </h1>
          {bookings.length === 0 ? (
            <p className="text-lg sm:text-xl text-white text-center res__font">
              No orders found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-black/80 p-6 rounded-lg shadow-md"
                >
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                    Booking for {booking.name}
                  </h3>
                  <p className="text-lg sm:text-xl text-white res__font">
                    Mobile: {booking.mobile_number}
                  </p>
                  <p className="text-lg sm:text-xl text-white res__font">
                    Persons: {booking.persons}
                  </p>
                  <p className="text-lg sm:text-xl text-white res__font">
                    Date: {new Date(booking.booking_date).toLocaleDateString()}
                  </p>
                  <p className="text-lg sm:text-xl text-white res__font">
                    Time: {booking.booking_time}
                  </p>
                  {booking.message && (
                    <p className="text-lg sm:text-xl text-white res__font">
                      Message: {booking.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mt-2 res__font">
                    Booked on: {new Date(booking.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
