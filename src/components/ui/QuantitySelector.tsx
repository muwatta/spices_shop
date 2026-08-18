"use client";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  size = "md",
}: QuantitySelectorProps) {
  const handleChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= min && next <= max) {
      onQuantityChange(next);
    }
  };

  return (
    <div className="qty-selector" role="group" aria-label="Quantity">
      <button
        type="button"
        className="qty-selector__btn"
        onClick={() => handleChange(-1)}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="qty-selector__value" aria-live="polite" aria-atomic="true">
        {quantity}
      </span>
      <button
        type="button"
        className="qty-selector__btn"
        onClick={() => handleChange(1)}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
