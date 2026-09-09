export interface Contact {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  message: string;
  created_at: string;
}

export interface PanelBooking {
  id: string;
  user_id: string | null;
  name: string;
  mobile_number: string;
  persons: number;
  booking_date: string;
  booking_time: string;
  message?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  session_id: string | null;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  address: string;
  payment_method: string;
  subtotal: number;
  delivery_charges: number;
  discount_amount: number;
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_id: string;
  size: string;
  quantity: number;
  price: number;
  food: {
    name: string;
    image_urls: string[];
  };
}

export interface CartItem {
  id: string;
  user_id: string | null;
  food_id: string;
  size: string;
  quantity: number;
  food: {
    name: string;
    image_urls: string[];
    sizes: { size: string; price: number; cutPrice?: number }[];
  };
}
