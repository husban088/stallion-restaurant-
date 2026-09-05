"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { PanelBooking } from "../components/types";
import SkeletonLoader from "./SkeletonLoader";

interface TableBookedTabProps {
  bookings: PanelBooking[];
  userId: string | null;
}

function TableBookedTab({
  bookings: initialBookings,
  userId,
}: TableBookedTabProps) {
  const [bookings, setBookings] = useState<PanelBooking[]>(initialBookings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load cached bookings immediately
    const cacheKey = userId ? `bookings_${userId}` : `bookings_guest`;
    const cachedBookings = localStorage.getItem(cacheKey);
    if (cachedBookings) {
      setBookings(JSON.parse(cachedBookings));
      setIsLoading(false);
    } else {
      setBookings(initialBookings);
      setIsLoading(false);
    }

    // Fetch bookings from Supabase (for authenticated users)
    const fetchBookings = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase
            .from("panel_bookings")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
          if (error) throw error;
          setBookings(data || []);
          localStorage.setItem(cacheKey, JSON.stringify(data || []));
        } catch (error: any) {
          console.error("Error fetching bookings:", error);
        }
      }
    };

    if (userId) {
      fetchBookings();
    }

    // Set up real-time subscription
    const channel = supabase
      .channel(`panel_bookings_${userId || "guest"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "panel_bookings" },
        () => {
          if (userId) fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, initialBookings]);

  if (isLoading) {
    return <SkeletonLoader layout="tableBookedTab" />;
  }

  return (
    <div className="bg-black/80 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] text-center mb-8 stallion__font">
        Table Bookings
      </h2>
      {bookings.length === 0 ? (
        <p className="text-lg sm:text-xl text-white text-center res__font">
          No bookings found.
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
  );
}

export default TableBookedTab;
