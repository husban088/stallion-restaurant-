// app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans, Forum, Gwendolyn } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

const forum = Forum({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-forum",
});

const gwendolyn = Gwendolyn({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gwendolyn",
});

export const metadata: Metadata = {
  title: "Stallion Restaurant",
  description:
    "Delivering an unforgettable culinary experience with every bite",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${forum.variable} ${gwendolyn.variable}`}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
