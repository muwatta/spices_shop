"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Leaf,
  BookOpen,
  BarChart3,
  Users,
  FileText,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin/orders", label: "Orders", icon: Package },
      { href: "/admin/products", label: "Products", icon: Leaf },
      { href: "/admin/manual-order", label: "Manual Order", icon: FileText },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/do-you-know", label: "Do You Know", icon: BookOpen },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      <header className="admin-topbar">
        <div className="admin-topbar__left">
          <button
            className="admin-topbar__hamburger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="admin-navigation"
          >
            <Menu size={20} />
          </button>
          <span className="admin-topbar__title">KMA Admin</span>
        </div>
        <Link href="/shop" className="admin-topbar__shop">
          View Shop
        </Link>
      </header>

      <div
        className={`admin-overlay ${open ? "" : "admin-overlay--hidden"}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside id="admin-navigation" className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`} aria-label="Admin navigation">
        <div className="admin-sidebar__header">
          <Link href="/admin" className="admin-sidebar__brand" onClick={close}>
            <Image src="/images/logo.jpg" alt="KMA" width={32} height={32} style={{ borderRadius: "var(--radius-md)" }} />
            <span>KMA Admin</span>
          </Link>
          <button className="admin-sidebar__close" onClick={close} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="admin-sidebar__section-label">{section.label}</div>
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="admin-sidebar__icon">
                      <item.icon size={18} />
                    </span>
                    <span className="admin-sidebar__label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/shop" className="admin-sidebar__back" onClick={close}>
            <ExternalLink size={14} />
            View Store
          </Link>
        </div>
      </aside>
    </>
  );
}
