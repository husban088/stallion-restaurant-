"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import AddFoodForm from "../../components/AddFoodForm";
import PanelNavbar from "../../components/PanelNavbar";
import ContactsTab from "../../components/ContactsTab";
import OrdersTab from "../../components/OrdersTab";
import TableBookedTab from "../../components/TableBookedTab";
import { Contact, PanelBooking } from "../../components/types";

export default function Panel() {
  const [activeTab, setActiveTab] = useState("add_food");
  const [bookings, setBookings] = useState<PanelBooking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Add userId state

  // Fetch userId on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        } else {
          setError("Authentication required");
          toast.error("Please log in to view the panel");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to authenticate user");
        toast.error("Failed to authenticate user");
      }
    };

    fetchUser();
  }, []);

  const fetchPanelBookings = useCallback(async () => {
    if (!userId) return; // Only fetch if userId is available
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("panel_bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      console.error(error);
      setError("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      toast.error("Failed to fetch contacts");
      console.error(error);
      setError("Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setError(null);
    if (activeTab === "table_booked" && userId) {
      fetchPanelBookings();
    } else if (activeTab === "contacts") {
      fetchContacts();
    } else {
      setIsLoading(false);
    }
  }, [activeTab, fetchPanelBookings, fetchContacts, userId]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#222] flex items-center justify-center">
        <div className="text-center">
          <PanelNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
          <p className="text-xl text-white res__font mt-20">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#d7a95f] text-black res__font rounded hover:bg-[#b5894c]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222]">
      <PanelNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <section className="relative w-full bg-[#222] py-12 pt-[9.5rem]">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            {isLoading ? (
              <div className="text-center">
                <p className="text-lg sm:text-xl text-white res__font">
                  Loading...
                </p>
              </div>
            ) : (
              <>
                {activeTab === "add_food" && <AddFoodForm />}
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "table_booked" && userId && (
                  <TableBookedTab bookings={bookings} userId={userId} />
                )}
                {activeTab === "contacts" && (
                  <ContactsTab contacts={contacts} />
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
