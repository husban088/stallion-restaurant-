import { useCartStore } from "../lib/cartStore";

export const useCart = () => {
  const {
    addToCart,
    cartItems,
    totalItems,
    isLoading,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    setupSubscription,
  } = useCartStore();

  return {
    addToCart,
    cartItems,
    totalItems,
    isLoading,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    setupSubscription,
  };
};
