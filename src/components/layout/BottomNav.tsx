"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User, Leaf } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Shop", icon: Leaf },
  { href: "/search?q=", label: "Search", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
  { href: "/account", label: "Account", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : item.href === "/cart"
              ? pathname === "/cart"
              : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`}
          >
            <span className="bottom-nav__icon">
              <item.icon size={20} />
              {item.badge && totalItems > 0 && (
                <span className="bottom-nav__badge">{totalItems}</span>
              )}
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
