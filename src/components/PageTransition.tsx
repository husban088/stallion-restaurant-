"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PageTransitionProps {
  onComplete: () => void;
}

export default function PageTransition({ onComplete }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 200); // 200ms fade
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity duration-200">
      <div className="animate-pulse">
        <Image
          src="/logo.png"
          alt="Stallion Restaurant Logo"
          width={150}
          height={50}
          className="w-[120px] sm:w-[150px]"
        />
      </div>
    </div>
  );
}
