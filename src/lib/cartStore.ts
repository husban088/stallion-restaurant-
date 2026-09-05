import { create } from "zustand";
import { supabase } from "./supabase";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { CartItem } from "../components/types";

interface CartRow {
  id: string;
  user_id: string | null;
  food_id: string;
  size: string;
  quantity: number;
  food: {
    name: string;
    image_urls: string[];
    sizes: { size: string; price: number; cutPrice?: number }[];
  } | null;
}

interface CartState {
  cartItems: CartItem[];
  totalItems: number;
  isLoading: boolean;
  isCartOpen: boolean;
  fetchCart: (userId: string | null) => Promise<void>;
  addToCart: (
    foodId: string,
    size: string,
    quantity?: number,
    food?: CartItem["food"]
  ) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setIsCartOpen: (isOpen: boolean) => void;
  setupSubscription: (userId: string) => () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  totalItems: 0,
  isLoading: false,
  isCartOpen: false,

  fetchCart: async (userId: string | null) => {
    console.log(`Fetching cart for user: ${userId || "guest"}`);
    set({ isLoading: true });
    try {
      let cartItems: CartItem[] = [];

      // Load cached cart
      const cacheKey = userId ? `cart_${userId}` : `cart_guest`;
      const cachedCart = localStorage.getItem(cacheKey);
      if (cachedCart) {
        cartItems = JSON.parse(cachedCart);
      }

      // Fetch from Supabase for authenticated users
      if (userId) {
        const { data, error } = await supabase
          .from("carts")
          .select(
            `
            id,
            user_id,
            food_id,
            size,
            quantity,
            food:foods (
              name,
              image_urls,
              sizes
            )
          `
          )
          .eq("user_id", userId);

        if (error) throw error;

        cartItems = (data || []).map((row: any) => {
          // Ensure food is a single object or null
          const foodData = row.food as {
            name: string;
            image_urls: string[];
            sizes: any[];
          } | null;

          return {
            id: row.id,
            user_id: row.user_id,
            food_id: row.food_id,
            size: row.size,
            quantity: row.quantity,
            food: foodData
              ? {
                  name: foodData.name || "Unknown",
                  image_urls: Array.isArray(foodData.image_urls)
                    ? foodData.image_urls
                    : [],
                  sizes: Array.isArray(foodData.sizes)
                    ? foodData.sizes.filter(
                        (
                          s
                        ): s is {
                          size: string;
                          price: number;
                          cutPrice?: number;
                        } =>
                          typeof s === "object" &&
                          s !== null &&
                          "size" in s &&
                          "price" in s &&
                          typeof s.size === "string" &&
                          typeof s.price === "number"
                      )
                    : [],
                }
              : {
                  name: "Unknown",
                  image_urls: [],
                  sizes: [],
                },
          };
        });

        // Cache to localStorage
        localStorage.setItem(cacheKey, JSON.stringify(cartItems));
      }

      set({
        cartItems,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        isLoading: false,
      });
      console.log(`Cart fetched: ${cartItems.length} items`);
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      toast.error(error.message || "Failed to load cart");
      set({ isLoading: false });
    }
  },

  addToCart: async (
    foodId: string,
    size: string,
    quantity: number = 1,
    food?: CartItem["food"]
  ) => {
    console.log(
      `Adding to cart: foodId=${foodId}, size=${size}, quantity=${quantity}`
    );
    try {
      const { cartItems, fetchCart } = get();
      const userId = (await supabase.auth.getUser()).data.user?.id || null;
      const cacheKey = userId ? `cart_${userId}` : `cart_guest`;

      // Check for existing item
      const existingItem = cartItems.find(
        (item) => item.food_id === foodId && item.size === size
      );

      if (existingItem) {
        await get().updateQuantity(
          existingItem.id,
          existingItem.quantity + quantity
        );
        set({ isCartOpen: true });
        await fetchCart(userId); // Ensure state is synced
        return;
      }

      // Fetch food details if not provided
      let cartFood = food;
      if (!cartFood) {
        const { data: foodData, error } = await supabase
          .from("foods")
          .select("name, image_urls, sizes")
          .eq("id", foodId)
          .single();
        if (error || !foodData) throw new Error("Failed to fetch food details");
        cartFood = {
          name: foodData.name || "Unknown",
          image_urls: Array.isArray(foodData.image_urls)
            ? foodData.image_urls
            : [],
          sizes: Array.isArray(foodData.sizes)
            ? foodData.sizes.filter(
                (s): s is { size: string; price: number; cutPrice?: number } =>
                  typeof s === "object" &&
                  s !== null &&
                  "size" in s &&
                  "price" in s &&
                  typeof s.size === "string" &&
                  typeof s.price === "number"
              )
            : [],
        };
      }

      // Create new cart item
      const newItem: CartItem = {
        id: userId ? uuidv4() : `guest_${uuidv4()}`,
        user_id: userId,
        food_id: foodId,
        size,
        quantity,
        food: cartFood,
      };

      // Optimistic update
      const updatedCart = [...cartItems, newItem];
      set({
        cartItems: updatedCart,
        totalItems: updatedCart.reduce((sum, item) => sum + item.quantity, 0),
        isCartOpen: true, // Fixed typo: changed 'aperture' to 'isCartOpen'
      });
      localStorage.setItem(cacheKey, JSON.stringify(updatedCart));

      // Save to Supabase for authenticated users
      if (userId) {
        const { error } = await supabase.from("carts").insert([
          {
            id: newItem.id,
            user_id: userId,
            food_id: foodId,
            size,
            quantity,
          },
        ]);
        if (error) throw error;
      }

      await fetchCart(userId); // Sync state after insertion
      toast.success("Item added to cart!");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add item to cart");
      await get().fetchCart(
        (await supabase.auth.getUser()).data.user?.id || null
      );
    }
  },

  updateQuantity: async (itemId: string, newQuantity: number) => {
    console.log(`Updating quantity for item ${itemId} to ${newQuantity}`);
    try {
      const { cartItems, fetchCart } = get();
      const userId = (await supabase.auth.getUser()).data.user?.id || null;
      const cacheKey = userId ? `cart_${userId}` : `cart_guest`;

      // Remove item if quantity is 0 or less
      if (newQuantity < 1) {
        await get().removeFromCart(itemId);
        return;
      }

      // Optimistic update
      const updatedCart = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      set({
        cartItems: updatedCart,
        totalItems: updatedCart.reduce((sum, item) => sum + item.quantity, 0),
      });
      localStorage.setItem(cacheKey, JSON.stringify(updatedCart));

      // Update Supabase for authenticated users
      if (userId) {
        const { error } = await supabase
          .from("carts")
          .update({ quantity: newQuantity })
          .eq("id", itemId)
          .eq("user_id", userId);
        if (error) throw error;
      }

      await fetchCart(userId); // Sync state after update
      toast.success("Quantity updated!");
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast.error(error.message || "Failed to update quantity");
      await get().fetchCart(
        (await supabase.auth.getUser()).data.user?.id || null
      );
    }
  },

  removeFromCart: async (itemId: string) => {
    console.log(`Removing item ${itemId} from cart`);
    try {
      const { cartItems, fetchCart } = get();
      const userId = (await supabase.auth.getUser()).data.user?.id || null;
      const cacheKey = userId ? `cart_${userId}` : `cart_guest`;

      // Optimistic update
      const updatedCart = cartItems.filter((item) => item.id !== itemId);
      set({
        cartItems: updatedCart,
        totalItems: updatedCart.reduce((sum, item) => sum + item.quantity, 0),
      });
      localStorage.setItem(cacheKey, JSON.stringify(updatedCart));

      // Remove from Supabase for authenticated users
      if (userId) {
        const { error } = await supabase
          .from("carts")
          .delete()
          .eq("id", itemId)
          .eq("user_id", userId);
        if (error) throw error;
      }

      await fetchCart(userId); // Sync state after removal
      toast.success("Item removed from cart!");
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      toast.error(error.message || "Failed to remove item");
      await get().fetchCart(
        (await supabase.auth.getUser()).data.user?.id || null
      );
    }
  },

  clearCart: async () => {
    console.log("Clearing cart");
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id || null;
      const cacheKey = userId ? `cart_${userId}` : `cart_guest`;

      // Clear state and localStorage
      set({ cartItems: [], totalItems: 0 });
      localStorage.removeItem(cacheKey);

      // Clear Supabase for authenticated users
      if (userId) {
        const { error } = await supabase
          .from("carts")
          .delete()
          .eq("user_id", userId);
        if (error) throw error;
      }

      toast.success("Cart cleared!");
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      toast.error(error.message || "Failed to clear cart");
      await get().fetchCart(
        (await supabase.auth.getUser()).data.user?.id || null
      );
    }
  },

  setIsCartOpen: (isOpen: boolean) => {
    console.log(`Setting isCartOpen to ${isOpen}`);
    set({ isCartOpen: isOpen });
  },

  setupSubscription: (userId: string) => {
    console.log(`Setting up subscription for user: ${userId}`);
    const channel = supabase
      .channel(`cart_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "carts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log(
            `Database change detected, fetching cart for user: ${userId}`
          );
          get().fetchCart(userId);
        }
      )
      .subscribe();

    return () => {
      console.log(`Removing subscription for user: ${userId}`);
      supabase.removeChannel(channel);
    };
  },
}));
