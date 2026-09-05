// app/ClientLayoutWrapper.tsx
"use client";

import ClientLayout from "./components/ClientLayout";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";
import { NavigationProvider } from "../components/NavigationProvider";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>{`
        .stallion__font {
          font-family: var(--font-forum), serif;
        }
        .res__font {
          font-family: var(--font-dm-sans), sans-serif;
        }
        .gwendolyn__font {
          font-family: var(--font-gwendolyn), cursive;
        }
      `}</style>
      <Toaster position="top-right" />
      <NavigationProvider>
        <ClientLayout>
          <main>{children}</main>
        </ClientLayout>
        <Footer />
      </NavigationProvider>
    </>
  );
}
