export type OrderStatus = "pending" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled";
export type PaymentMethod = "bank_transfer" | "cash_on_delivery" | "paystack";
export type PaymentStatus = "pending" | "verified" | "paid" | "failed" | "refunded";
export type ProductCategory = "spices" | "herbs" | "seasonings" | "blends" | "peppers" | "oils" | "flours" | "other";
export type ProductStatus = "active" | "out_of_stock" | "draft" | "archived";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  spices: "Spices",
  herbs: "Herbs",
  seasonings: "Seasonings",
  blends: "Blends",
  peppers: "Peppers",
  oils: "Oils",
  flours: "Flours",
  other: "Other",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  out_of_stock: "Out of Stock",
  draft: "Draft",
  archived: "Archived",
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock: number | null;
  created_at: string;
  category: ProductCategory | null;
  status: ProductStatus;
  low_stock_threshold: number;
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
  payment_status: PaymentStatus;
  payment_proof_url: string | null;
  total_amount: number;
  delivery_address: string | null;
  transaction_id: string | null;
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
