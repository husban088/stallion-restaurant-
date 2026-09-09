"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingAnimationProps {
  onComplete: () => void;
}

export default function LoadingAnimation({
  onComplete,
}: LoadingAnimationProps) {
  const [typedText, setTypedText] = useState("");
  const fullText = "Welcome to the Stallion Restaurant";
  const typingSpeed = 100; // ms per character

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-transform duration-1000 ease-in-out"
      style={{
        transform:
          typedText === fullText ? "translateY(-100%)" : "translateY(0)",
      }}
    >
      <h1 className="text-4xl sm:text-4xl md:text-5xl text-white italic stallion__font text-center px-4">
        {typedText}
        {typedText !== fullText && <span className="animate-blink"></span>}
      </h1>
      <div className="mt-8">
        <Image
          src="/logo.png"
          alt="Stallion Restaurant Logo"
          width={150}
          height={50}
          className="w-[150px] sm:w-[150px]"
        />
      </div>
    </div>
  );
}
