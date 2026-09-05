// app/order-placed/page.tsx
import { Suspense } from "react";
import OrderPlacedContent from "./OrderPlacedContent";

export default function OrderPlaced() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#222] flex items-center justify-center">
          <div
            className="w-24 h-24 border-4 border-[#d7a95f] border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading order details"
          ></div>
        </div>
      }
    >
      <OrderPlacedContent />
    </Suspense>
  );
}
