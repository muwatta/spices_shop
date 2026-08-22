"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CartItem, useCartStore } from "@/lib/store/cart";

const MAX_ITEMS = 100;

function normalizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      productId: typeof item.productId === "string" ? item.productId : "",
      quantity: Number.isSafeInteger(item.quantity) ? Number(item.quantity) : 0,
      stock: typeof item.stock === "number" || item.stock === null ? item.stock : null,
    }))
    .filter((item) => item.productId && item.quantity > 0 && item.quantity <= 99)
    .slice(0, MAX_ITEMS);
}

function mergeItems(local: CartItem[], remote: CartItem[]) {
  const merged = new Map(remote.map((item) => [item.productId, item]));
  for (const item of local) {
    const existing = merged.get(item.productId);
    merged.set(item.productId, {
      ...item,
      quantity: Math.min(99, Math.max(item.quantity, existing?.quantity ?? 0)),
      stock: existing?.stock ?? item.stock,
    });
  }
  return Array.from(merged.values()).slice(0, MAX_ITEMS);
}

export default function CartSync() {
  const supabase = useRef(createClient()).current;
  const syncing = useRef(false);
  const userId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function save(items: CartItem[]) {
      if (!userId.current || syncing.current) return;
      await supabase.from("user_carts").upsert({ user_id: userId.current, items: normalizeItems(items) });
    }

    async function load(userIdValue: string) {
      userId.current = userIdValue;
      const { data } = await supabase.from("user_carts").select("items").eq("user_id", userIdValue).maybeSingle();
      if (!active) return;
      const localItems = useCartStore.getState().items;
      const remoteItems = normalizeItems(data?.items);
      const merged = mergeItems(localItems, remoteItems);
      syncing.current = true;
      useCartStore.setState({ items: merged });
      syncing.current = false;
      await save(merged);
    }

    const unsubscribe = useCartStore.subscribe((state) => {
      if (!userId.current || syncing.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(state.items), 400);
    });

    const authSubscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void load(session.user.id);
      else userId.current = null;
    });

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void load(data.user.id);
    });

    const channel = supabase
      .channel("user-cart-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_carts" }, (payload) => {
        const nextCart = payload.new as { user_id?: string; items?: unknown };
        if (nextCart.user_id !== userId.current) return;
        syncing.current = true;
        useCartStore.setState({ items: normalizeItems(nextCart.items) });
        syncing.current = false;
      })
      .subscribe();

    return () => {
      active = false;
      unsubscribe();
      authSubscription.data.subscription.unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  return null;
}