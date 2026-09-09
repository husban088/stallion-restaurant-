"use client";

import { useEffect, useState } from "react";
import { Contact } from "./types";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";

interface ContactsTabProps {
  contacts: Contact[] | null;
}

export default function ContactsTab({ contacts }: ContactsTabProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please log in to view contacts");
          setIsAdmin(false);
          return;
        }
        // Check if the user is the admin based on email
        if (user.email === "stallionmarket24@gmail.com") {
          setIsAdmin(true);
        } else {
          toast.error("Only admins can view contacts");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Failed to verify admin status");
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (isLoading) {
    return <SkeletonLoader layout="contactsTab" />;
  }

  if (!isAdmin) {
    return (
      <div className="bg-black/80 p-6 rounded-lg shadow-md">
        <p className="text-lg sm:text-xl text-white text-center res__font">
          Unauthorized: Only admins can view contact messages.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-black/80 p-6 rounded-lg shadow-md"
      role="region"
      aria-label="Contact Messages"
    >
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] text-center mb-8 stallion__font">
        Contact Messages
      </h2>
      {!contacts || contacts.length === 0 ? (
        <p className="text-lg sm:text-xl text-white text-center res__font">
          No contact messages found.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          aria-live="polite"
        >
          {contacts
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .map((contact) => (
              <div
                key={contact.id}
                className="bg-black/80 p-6 rounded-lg shadow-md"
                role="article"
                aria-label={`Message from ${contact.name}`}
              >
                <h3 className="text-xl sm:text-2xl font-semibold text-[#d7a95f] mb-2 stallion__font">
                  Message from {contact.name}
                </h3>
                <p className="text-lg sm:text-xl text-white res__font">
                  Phone:{" "}
                  <a
                    href={`tel:${contact.phone_number}`}
                    className="text-[#d7a95f] hover:underline"
                    aria-label={`Call ${contact.name} at ${contact.phone_number}`}
                  >
                    {contact.phone_number}
                  </a>
                </p>
                <p className="text-lg sm:text-xl text-white res__font">
                  Email:{" "}
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-[#d7a95f] hover:underline"
                    aria-label={`Email ${contact.name} at ${contact.email}`}
                  >
                    {contact.email}
                  </a>
                </p>
                {contact.message && (
                  <p className="text-lg sm:text-xl text-white res__font">
                    Message: {contact.message}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-2 res__font">
                  Sent on: {new Date(contact.created_at).toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
