"use client";

import { useState, useEffect } from "react";
import { formatNaira } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function ManualOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await fetch(
      `/api/admin/customers/search?q=${encodeURIComponent(searchQuery)}`,
    );
    const data = await res.json();
    setCustomers(data);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomers([]);
    setSearchQuery("");
  };

  const createCustomer = async () => {
    if (!newCustomer.full_name || !newCustomer.email) {
      toast.error("Name and email required");
      return;
    }
    const res = await fetch("/api/admin/customers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    });
    if (res.ok) {
      const customer = await res.json();
      setSelectedCustomer(customer);
      setShowNewCustomerForm(false);
      setNewCustomer({ full_name: "", email: "", phone: "" });
      toast.success("Customer created");
    } else {
      toast.error("Failed to create customer");
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product_id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const placeOrder = async () => {
    if (!selectedCustomer) {
      toast.error("Select a customer");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!deliveryAddress) {
      toast.error("Delivery address required");
      return;
    }
    setLoading(true);
    const items = cart.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));
    const res = await fetch("/api/admin/orders/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: selectedCustomer.id,
        items,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
      }),
    });
    if (res.ok) {
      const order = await res.json();
      toast.success("Order placed");
      const pdfRes = await fetch("/api/admin/orders/generate-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (pdfRes.ok) {
        const blob = await pdfRes.blob();
        const url = URL.createObjectURL(blob);
        const message = `Order #${order.id.slice(0, 8).toUpperCase()} - Total ${formatNaira(order.total_amount)}. Receipt attached.`;
        const whatsappUrl = `https://wa.me/${selectedCustomer.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        const a = document.createElement("a");
        a.href = url;
        a.download = `receipt-${order.id.slice(0, 8)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setCart([]);
      setDeliveryAddress("");
      setSelectedCustomer(null);
    } else {
      toast.error("Failed to place order");
    }
    setLoading(false);
  };

  const totalCart = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            margin: 0,
          }}
        >
          Manual Order Creation
        </h1>
        {selectedCustomer && (
          <div
            style={{
              background: "var(--clr-cream-dark)",
              padding: "0.5rem 1rem",
              borderRadius: "2rem",
            }}
          >
            👤 {selectedCustomer.full_name}
          </div>
        )}
      </div>

      {/* Customer selection card */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.2rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          👥 Customer
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type name, email or phone"
              className="form-input"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setShowNewCustomerForm(true)}
            >
              New Customer
            </button>
          </div>

          {customers.length > 0 && (
            <div
              style={{
                border: "1px solid var(--clr-cream-dark)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              {customers.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: "0.75rem",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--clr-cream-dark)",
                    transition: "background 0.2s",
                  }}
                  onClick={() => selectCustomer(c)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--clr-cream)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <strong>{c.full_name}</strong> – {c.email}{" "}
                  {c.phone && `– ${c.phone}`}
                </div>
              ))}
            </div>
          )}

          {selectedCustomer && (
            <div
              style={{
                background: "var(--clr-cream)",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                borderLeft: "4px solid var(--clr-saffron)",
              }}
            >
              ✅ Selected: {selectedCustomer.full_name} (
              {selectedCustomer.email})
            </div>
          )}
        </div>
      </div>

      {/* New customer modal inline */}
      {showNewCustomerForm && (
        <div
          className="card"
          style={{
            padding: "1.5rem",
            marginBottom: "2rem",
            border: "1px solid var(--clr-saffron)",
          }}
        >
          <h3 style={{ marginBottom: "1rem" }}>Create New Customer</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Full Name *"
              className="form-input"
              value={newCustomer.full_name}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, full_name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email *"
              className="form-input"
              value={newCustomer.email}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, email: e.target.value })
              }
            />
            <input
              type="tel"
              placeholder="Phone"
              className="form-input"
              value={newCustomer.phone}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, phone: e.target.value })
              }
            />
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setShowNewCustomerForm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createCustomer}>
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products & cart grid (if customer selected) */}
      {selectedCustomer && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Product selection */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              🛍️ Add Products
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))",
                gap: "1rem",
              }}
            >
              {products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid var(--clr-cream-dark)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    {p.name}
                  </div>
                  <div
                    style={{
                      color: "var(--clr-saffron-dark)",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {formatNaira(p.price)}
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => addToCart(p)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div
            className="card"
            style={{
              padding: "1.5rem",
              alignSelf: "start",
              position: "sticky",
              top: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.2rem",
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              🛒 Cart
              {cart.length > 0 && (
                <span
                  style={{
                    fontSize: "0.85rem",
                    background: "var(--clr-saffron)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "2rem",
                    color: "var(--clr-bark)",
                  }}
                >
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items
                </span>
              )}
            </h2>
            {cart.length === 0 ? (
              <p
                style={{
                  color: "var(--clr-muted)",
                  textAlign: "center",
                  padding: "2rem 0",
                }}
              >
                Cart is empty. Add products.
              </p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: "2px solid var(--clr-cream-dark)",
                        }}
                      >
                        <th style={{ textAlign: "left", padding: "0.5rem 0" }}>
                          Product
                        </th>
                        <th style={{ textAlign: "center" }}>Qty</th>
                        <th style={{ textAlign: "right" }}>Price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr
                          key={item.product_id}
                          style={{
                            borderBottom: "1px solid var(--clr-cream-dark)",
                          }}
                        >
                          <td style={{ padding: "0.5rem 0" }}>{item.name}</td>
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.product_id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              style={{
                                width: "60px",
                                textAlign: "center",
                                padding: "0.25rem",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--clr-cream-dark)",
                              }}
                            />
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {formatNaira(item.price * item.quantity)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => updateQuantity(item.product_id, 0)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--clr-chili)",
                                fontSize: "1.2rem",
                              }}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr
                        style={{
                          borderTop: "2px solid var(--clr-cream-dark)",
                          fontWeight: 700,
                        }}
                      >
                        <td
                          colSpan={2}
                          style={{ textAlign: "right", paddingTop: "0.75rem" }}
                        >
                          Total:
                        </td>
                        <td
                          style={{ textAlign: "right", paddingTop: "0.75rem" }}
                        >
                          {formatNaira(totalCart)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <label className="form-label">Delivery Address</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Full delivery address"
                  />
                  <label className="form-label" style={{ marginTop: "1rem" }}>
                    Payment Method
                  </label>
                  <select
                    className="form-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={placeOrder}
                    disabled={loading}
                    style={{ width: "100%", marginTop: "1.5rem" }}
                  >
                    {loading
                      ? "Placing order..."
                      : "Place Order & Send Receipt"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
}
