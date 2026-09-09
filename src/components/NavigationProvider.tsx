"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import PageTransition from "./PageTransition";

interface NavigationContextType {
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  const navigate = (path: string) => {
    // Prevent navigation if already on the target path
    if (path === window.location.pathname) return;

    setNextPath(path);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    if (nextPath) {
      router.push(nextPath);
      setNextPath(null);
    }
  };

  return (
    <NavigationContext.Provider value={{ navigate }}>
      {children}
      {isTransitioning && (
        <PageTransition onComplete={handleTransitionComplete} />
      )}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
