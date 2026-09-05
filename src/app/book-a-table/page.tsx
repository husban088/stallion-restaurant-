"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { PanelBooking } from "../../components/types";
import TableBookedTab from "../../components/TableBookedTab";
import { v4 as uuidv4 } from "uuid";

export default function BookATable() {
  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    persons: "",
    booking_date: "",
    booking_time: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookings, setBookings] = useState<PanelBooking[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const persons = Array.from({ length: 10 }, (_, i) => i + 1);
  const times = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
  ];

  useEffect(() => {
    const initializeBookings = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentUserId = authData.user?.id || null;
        setUserId(currentUserId);

        const cacheKey = currentUserId
          ? `bookings_${currentUserId}`
          : `bookings_guest`;
        const cachedBookings = localStorage.getItem(cacheKey);
        if (cachedBookings) {
          setBookings(JSON.parse(cachedBookings));
        }

        if (currentUserId) {
          const { data, error } = await supabase
            .from("panel_bookings")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false });
          if (error) throw error;
          setBookings(data || []);
          localStorage.setItem(cacheKey, JSON.stringify(data || []));
        }
      } catch (error: any) {
        console.error("Error initializing bookings:", error);
        toast.error("Failed to load bookings");
      }
    };

    initializeBookings();

    const channel = supabase
      .channel("panel_bookings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "panel_bookings" },
        async () => {
          if (userId) {
            const { data, error } = await supabase
              .from("panel_bookings")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false });
            if (!error) {
              setBookings(data || []);
              localStorage.setItem(
                `bookings_${userId}`,
                JSON.stringify(data || []),
              );
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      name,
      mobile_number,
      persons,
      booking_date,
      booking_time,
      message,
    } = formData;
    if (!name || !mobile_number || !persons || !booking_date || !booking_time) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id || null;
      const cacheKey = currentUserId
        ? `bookings_${currentUserId}`
        : `bookings_guest`;

      // Optimistic update
      const newBooking: PanelBooking = {
        id: uuidv4(),
        user_id: currentUserId,
        name,
        mobile_number,
        persons: parseInt(persons),
        booking_date,
        booking_time,
        message: message || undefined,
        created_at: new Date().toISOString(),
      };
      setBookings((prev) => [newBooking, ...prev]);
      localStorage.setItem(cacheKey, JSON.stringify([newBooking, ...bookings]));

      // Insert into Supabase
      const { data, error } = await supabase
        .from("panel_bookings")
        .insert([
          {
            name,
            mobile_number,
            persons: parseInt(persons),
            booking_date,
            booking_time,
            message: message || null,
            user_id: currentUserId,
          },
        ])
        .select();

      if (error) throw error;

      // Update bookings with server response
      const insertedBooking = data[0];
      setBookings((prev) =>
        prev.map((b) =>
          b.id === newBooking.id
            ? { ...insertedBooking, user_id: currentUserId }
            : b,
        ),
      );
      localStorage.setItem(cacheKey, JSON.stringify(bookings));

      toast.success("Table booked successfully!");
      setFormData({
        name: "",
        mobile_number: "",
        persons: "",
        booking_date: "",
        booking_time: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book table. Please try again.");
      // Revert optimistic update
      const cacheKey = userId ? `bookings_${userId}` : `bookings_guest`;
      setBookings((prev) => prev.filter((b) => b.id !== `temp-${Date.now()}`));
      localStorage.setItem(cacheKey, JSON.stringify(bookings));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative w-full bg-[#222] py-12 pt-[10rem] sm:pt-[13rem]">
        <Image
          src="/testimonial-bg.jpg"
          alt="Background"
          fill
          className="absolute inset-0 object-cover opacity-80 z-0"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white text-center mb-8 stallion__font max-w-3xl mx-auto">
            I wanted to thank you for inviting me down for that amazing dinner
            the other night. The food was extraordinary.
          </h1>
          <div className="flex flex-col items-center mb-12">
            <Image
              src="/head.jfif"
              alt="Chef"
              width={150}
              height={150}
              className="rounded-full object-cover border-4 border-[#d7a95f] shadow-md"
            />
            <p className="mt-4 text-xl sm:text-2xl text-[#d7a95f] font-semibold stallion__font">
              Oliver Bennett
            </p>
          </div>
          <div className="bg-black/80 p-6 rounded-lg shadow-md flex flex-col lg:flex-row gap-12 border-2 border-[#d7a95f]">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] mb-4 stallion__font text-center">
                Online Reservation
              </h2>
              <p className="text-lg sm:text-xl text-white text-center mb-6 res__font">
                Booking request{" "}
                <a
                  href="tel:+442079460958"
                  className="text-[#d7a95f] hover:underline"
                >
                  +44 20 7946 0958
                </a>{" "}
                or fill out the order form
              </p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-4 rounded-sm bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                    required
                  />
                  <input
                    type="tel"
                    name="mobile_number"
                    placeholder="Mobile Number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-4 rounded-sm bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    name="persons"
                    value={formData.persons}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-4 rounded-sm bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                    required
                  >
                    <option value="">Select Persons</option>
                    {persons.map((num) => (
                      <option key={num} value={num}>
                        {num} Person{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    name="booking_date"
                    value={formData.booking_date}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-4 rounded-sm bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                    required
                  />
                </div>
                <select
                  name="booking_time"
                  value={formData.booking_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-sm bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                  required
                >
                  <option value="">Select Time</option>
                  {times.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-sm bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font h-32 resize-none"
                />
                <div className="border-2 border-[#d7a95f]">
                  <button
                    type="submit"
                    className="w-full bg-transparent font-bold text-md sm:text-xl relative overflow-hidden border-2 border-[#d7a95f] text-[#d7a95f] px-6 py-2 transition-all duration-500 ease-in-out group"
                    disabled={isSubmitting}
                  >
                    <span className="absolute inset-0 bg-[#d7a95f] w-full h-0 group-hover:h-full bottom-0 left-0 transition-all duration-500 ease-in-out z-0"></span>
                    <span className="relative z-10 group-hover:text-white">
                      {isSubmitting ? "Booking..." : "Book a Table"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
            <div className="flex-1 relative">
              <Image
                src="/footer-form-bg.png"
                alt="Reservation"
                width={500}
                height={600}
                className="w-full h-[500px] sm:h-[600px] object-cover rounded-lg"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white bg-black/70 rounded-lg p-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                  Booking Request
                </h3>
                <p className="text-lg sm:text-xl mb-4 res__font">
                  <a
                    href="tel:+442079460958"
                    className="text-[#d7a95f] hover:underline"
                  >
                    +44 20 7946 0958
                  </a>
                </p>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                  Location
                </h3>
                <p className="text-lg sm:text-xl mb-4 res__font">
                  Baker Street, London, UK
                </p>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                  Lunch Time
                </h3>
                <p className="text-lg sm:text-xl res__font">Monday to Sunday</p>
                <p className="text-lg sm:text-xl mb-4 res__font">
                  11.00 am - 2.30pm
                </p>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                  Dinner Time
                </h3>
                <p className="text-lg sm:text-xl res__font">Monday to Sunday</p>
                <p className="text-lg sm:text-xl res__font">
                  05.00 pm - 10.00pm
                </p>
              </div>
            </div>
          </div>
          {bookings.length > 0 && (
            <div className="mt-8">
              <TableBookedTab bookings={bookings} userId={userId} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
