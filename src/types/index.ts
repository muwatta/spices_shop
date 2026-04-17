export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
export type PaymentMethod = "bank_transfer" | "cash_on_delivery";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock: number | null;
  created_at: string;
}

export interface DoYouKnowItem {
  id: string;
  name: string;
  subtitle: string | null;
  benefits: string | null;
  recommendation: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_proof_url: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
