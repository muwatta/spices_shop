# 🌶 KMA Spices & Herbs – E‑commerce Website

A full‑featured e‑commerce platform for a Nigerian spice business. Built with **Next.js 14 (App Router)**, **Supabase** (Auth, PostgreSQL, Storage, Realtime), **Tailwind CSS**, and deployed on **Vercel**.

Customers can browse spices, add to cart, checkout via bank transfer or cash on delivery, manage orders, and edit their profile. Admins have a dedicated dashboard to manage products, orders, and content – all with real‑time notifications.

🔗 **Live Demo:** [https://spices-shop.vercel.app](https://spices-shop.vercel.app)

---

## ✨ Features

### 👥 Customer
- Product catalog with images, prices, and stock status
- Shopping cart (persisted in localStorage)
- Checkout with two payment methods:
  - **Bank transfer** – customer uploads payment proof
  - **Cash on delivery**
- WhatsApp order button (pre‑filled cart summary)
- User accounts (signup, login, email verification)
- Order history with status tracking
- Profile editing (name, phone, full address, account number)
- Password change
- Responsive mobile‑first design

### 👑 Admin
- Secure admin login (only pre‑defined email)
- Dashboard with order list (filter by status)
- Real‑time order notifications (toast + browser alert)
- Update order status (pending → confirmed → delivered → cancelled)
- Product management (add, edit, delete, upload images)
- “Do You Know” content manager (educational spice guides)
- Inventory & sales report (total orders, revenue, pending orders, low stock alerts)

### 🔧 Technical Highlights
- **Row Level Security (RLS)** in Supabase ensures customers see only their own data.
- **Real‑time subscriptions** for new orders (admin panel).
- **Lazy loading** with Suspense and skeleton loaders for product grids.
- **Animated background** (floating spice emojis) and cart reminder popup.
- **Fully responsive** navbar with mobile drawer (hamburger menu).
- **Email notifications** on order confirmation and status changes (via Resend).

---

## 🛠 Tech Stack

| Area               | Technology |
|--------------------|------------|
| Framework          | Next.js 14 (App Router, Turbopack) |
| Language           | TypeScript |
| Styling            | Tailwind CSS + custom CSS variables |
| Database           | Supabase (PostgreSQL) |
| Authentication     | Supabase Auth (email/password) |
| Storage            | Supabase Storage (product images, payment proofs) |
| Real‑time          | Supabase Realtime |
| State Management   | Zustand (cart) |
| Animations         | Framer Motion |
| Email              | Resend |
| Hosting            | Vercel |
| Payment            | Bank transfer + Cash on delivery (Paystack/Flutterwave ready) |

---

## 📁 Folder Structure (simplified)
