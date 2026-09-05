"use client";

import { usePathname } from "next/navigation";
import Navbar from "../../components/Navbar";
import TopHeader from "../../components/TopHeader";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPanelPage = pathname === "/panel";

  return (
    <>
      {!isPanelPage && <TopHeader />}
      {!isPanelPage && <Navbar />}
      {children}
    </>
  );
}
