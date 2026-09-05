"use client";

import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Delivering from "../components/Delivering";
import WhyChooseUs from "../components/WhyChooseUs";
import SpecialDish from "../components/SpecialDish";
import LoadingAnimation from "../components/LoadingAnimation";
import { useNavigation } from "../components/NavigationProvider";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNavigation();

  useEffect(() => {
    // Check if loading animation should be shown (initial load or logo click)
    const shouldTriggerLoading =
      sessionStorage.getItem("triggerLoadingAnimation") === "true";
    if (shouldTriggerLoading) {
      setIsLoading(true);
    }
  }, []);

  const handleAnimationComplete = () => {
    setIsLoading(false);
    sessionStorage.removeItem("triggerLoadingAnimation");
  };

  return (
    <div
      style={{
        overflowX: "hidden",
        scrollBehavior: "smooth",
      }}
    >
      {isLoading ? (
        <LoadingAnimation onComplete={handleAnimationComplete} />
      ) : (
        <>
          <Hero />
          <Delivering />
          <SpecialDish />
          <WhyChooseUs />
        </>
      )}
    </div>
  );
}
