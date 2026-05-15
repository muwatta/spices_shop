"use client";

import { useState, useEffect } from "react";
import { formatNaira } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import styles from "./page.module.css";

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
      const errorData = await res.json();
      const errorMessage = errorData.error || "Failed to create customer";
      toast.error(errorMessage);
      console.error("Customer creation error:", errorData);
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manual Order Creation</h1>
        {selectedCustomer && (
          <div className={styles.selectedCustomerBadge}>
            👤 {selectedCustomer.full_name}
          </div>
        )}
      </div>

      {/* Customer selection card */}
      <div className={`card ${styles.customerCard}`}>
        <h2 className={styles.cardTitle}>👥 Customer</h2>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputGroup}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type name, email or phone"
              className={`form-input ${styles.searchInput}`}
              title="Search for customer by name, email, or phone"
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
            <div className={styles.customerList}>
              {customers.map((c) => (
                <div
                  key={c.id}
                  className={styles.customerItem}
                  onClick={() => selectCustomer(c)}
                >
                  <strong>{c.full_name}</strong> – {c.email}{" "}
                  {c.phone && `– ${c.phone}`}
                </div>
              ))}
            </div>
          )}

          {selectedCustomer && (
            <div className={styles.selectedCustomerBox}>
              ✅ Selected: {selectedCustomer.full_name} (
              {selectedCustomer.email})
            </div>
          )}
        </div>
      </div>

      {/* New customer modal inline */}
      {showNewCustomerForm && (
        <div className={`card ${styles.newCustomerCard}`}>
          <h3 className={styles.newCustomerTitle}>Create New Customer</h3>
          <div className={styles.newCustomerForm}>
            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Full Name"
                className="form-input"
                value={newCustomer.full_name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="form-input"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Phone"
                className="form-input"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>
            <div className={styles.newCustomerActions}>
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
        <div className={styles.productsCartGrid}>
          {/* Product selection */}
          <div className={`card ${styles.productsCard}`}>
            <h2 className={styles.productsTitle}>🛍️ Add Products</h2>
            <div className={styles.productGrid}>
              {products.map((p) => (
                <div key={p.id} className={styles.productCard}>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productPrice}>
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
          <div className={`card ${styles.cartCard}`}>
            <h2 className={styles.cartHeader}>
              🛒 Cart
              {cart.length > 0 && (
                <span className={styles.cartBadge}>
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items
                </span>
              )}
            </h2>
            {cart.length === 0 ? (
              <p className={styles.emptyCart}>Cart is empty. Add products.</p>
            ) : (
              <>
                <div className={styles.tableContainer}>
                  <table className={styles.cartTable}>
                    <thead>
                      <tr className={styles.tableHeadRow}>
                        <th className={styles.tableHeadCell}>Product</th>
                        <th className={styles.tableHeadCellCenter}>Qty</th>
                        <th className={styles.tableHeadCellRight}>Price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr
                          key={item.product_id}
                          className={styles.tableBodyRow}
                        >
                          <td className={styles.tableCell}>{item.name}</td>
                          <td className={styles.tableCellCenter}>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.product_id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className={styles.quantityInput}
                              title={`Quantity for ${item.name}`}
                              aria-label={`Quantity for ${item.name}`}
                            />
                          </td>
                          <td className={styles.tableCellRight}>
                            {formatNaira(item.price * item.quantity)}
                          </td>
                          <td className={styles.tableCellRight}>
                            <button
                              onClick={() => updateQuantity(item.product_id, 0)}
                              className={styles.deleteButton}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={styles.tableFootRow}>
                        <td colSpan={2} className={styles.tableFootFirstCell}>
                          Total:
                        </td>
                        <td className={styles.tableFootCell}>
                          {formatNaira(totalCart)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className={styles.cartActions}>
                  <label htmlFor="deliveryAddress" className="form-label">
                    Delivery Address
                  </label>
                  <textarea
                    id="deliveryAddress"
                    className="form-input"
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Full delivery address"
                  />
                  <label
                    htmlFor="paymentMethod"
                    className={`form-label ${styles.paymentLabel}`}
                  >
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    className="form-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    title="Select payment method"
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                  <button
                    className={`btn btn-primary btn-lg ${styles.placeOrderButton}`}
                    onClick={placeOrder}
                    disabled={loading}
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
