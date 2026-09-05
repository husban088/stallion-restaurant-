"use client";

import { useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { supabase } from "../lib/supabase";

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchCart, setupSubscription } = useCart();

  useEffect(() => {
    const initializeCart = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await fetchCart(user?.id || null);

      if (user?.id) {
        const cleanup = setupSubscription(user.id);
        return cleanup;
      }
    };

    initializeCart();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const userId = session?.user?.id || null;
        await fetchCart(userId);
        if (userId) {
          setupSubscription(userId);
        }
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [fetchCart, setupSubscription]);

  return <>{children}</>;
}
