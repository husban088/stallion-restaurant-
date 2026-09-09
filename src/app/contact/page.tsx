"use client";

import Image from "next/image";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { useState } from "react";

interface ContactForm {
  name: string;
  phone_number: string;
  email: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    phone_number: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("contacts").insert([
        {
          user_id: user?.id || null,
          name: formData.name,
          phone_number: formData.phone_number,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      toast.success("Message sent successfully!");
      setFormData({ name: "", phone_number: "", email: "", message: "" });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#222] text-white">
      <section className="w-full bg-[#222] py-12 pt-[8rem] sm:pt-[13rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-[#d7a95f] stallion__font mb-4">
            Contact Us
          </h1>
          <div>
            <Image
              src="/separator.svg"
              alt="Separator"
              width={150}
              height={20}
              className="w-[150px] mx-auto mb-4"
            />
          </div>
          <p className="text-lg sm:text-xl text-white res__font max-w-2xl mx-auto">
            We’d love to hear from you! Whether it’s a question, feedback, or a
            booking request, reach out and let’s connect.
          </p>
        </div>
      </section>
      <section className="w-full bg-[#222] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/80 p-6 sm:p-8 rounded-lg shadow-md">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] stallion__font mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white res__font"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full p-3 bg-[#333] text-white rounded-md border border-[#d7a95f]/50 focus:border-[#d7a95f] focus:ring focus:ring-[#d7a95f]/50 res__font"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-white res__font"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full p-3 bg-[#333] text-white rounded-md border border-[#d7a95f]/50 focus:border-[#d7a95f] focus:ring focus:ring-[#d7a95f]/50 res__font"
                    placeholder="+88-123-123456"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white res__font"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full p-3 bg-[#333] text-white rounded-md border border-[#d7a95f]/50 focus:border-[#d7a95f] focus:ring focus:ring-[#d7a95f]/50 res__font"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-white res__font"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 w-full p-3 bg-[#333] text-white rounded-md border border-[#d7a95f]/50 focus:border-[#d7a95f] focus:ring focus:ring-[#d7a95f]/50 res__font"
                    placeholder="Your message here..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 bg-[#d7a95f] text-white rounded-md text-md font-medium res__font hover:bg-[#b5894c] transition-all duration-300 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
            <div className="relative h-[400px] sm:h-[500px] lg:h-auto">
              <Image
                src="/footer-form-bg.png"
                alt="Contact Background"
                fill
                className="object-cover rounded-lg shine-effect"
              />
              <div className="text-center absolute inset-0 bg-black/60 rounded-lg flex flex-col justify-center items-center p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] stallion__font mb-6">
                  Contact Us
                </h2>
                <div className="space-y-4 text-white res__font">
                  <div>
                    <h3 className="text-lg font-semibold text-[#d7a95f]">
                      Booking Request
                    </h3>
                    <p>+92-336-0763840</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#d7a95f]">
                      Location
                    </h3>
                    <p>Faisalabad, Pakistan</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#d7a95f]">
                      Lunch Time
                    </h3>
                    <p>Monday to Sunday</p>
                    <p>11.00 am - 2.30pm</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#d7a95f]">
                      Dinner Time
                    </h3>
                    <p>Monday to Sunday</p>
                    <p>05.00 pm - 10.00pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
