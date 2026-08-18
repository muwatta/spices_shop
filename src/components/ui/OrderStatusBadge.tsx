export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`status status--${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
