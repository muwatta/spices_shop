"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Recommendation { id: string; name: string; price: number; image_url: string | null }
interface YoutubeVideo { title: string; url: string }

export default function ShoppingAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("Ask me what to use for a meal, flavour, or ingredient.");
  const [products, setProducts] = useState<Recommendation[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSignedIn(!!user);
      setAuthLoading(false);
    });
  }, []);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    const response = await fetch("/api/recommendations/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    const result = await response.json();
    setReply(response.ok ? result.reply : result.error || "Please try again.");
    setProducts(result.products ?? []);
    setYoutubeVideos(result.youtubeVideos ?? []);
    setLoading(false);
  }

  if (authLoading || !signedIn) return null;

  return (
    <aside className={`shopping-assistant ${open ? "shopping-assistant--open" : ""}`}>
      {open && (
        <div className="shopping-assistant__panel">
          <div className="shopping-assistant__header"><strong>Spice guide</strong><button onClick={() => setOpen(false)} aria-label="Close spice guide">×</button></div>
          <p className="shopping-assistant__reply">{reply}</p>
          {products.length > 0 && <div className="shopping-assistant__products">{products.map((product) => <Link key={product.id} href={`/product/${product.id}`} onClick={() => setOpen(false)}><span>{product.name}</span><small>{formatNaira(product.price)}</small></Link>)}</div>}
          {youtubeVideos.length > 0 && <div className="shopping-assistant__videos"><span className="shopping-assistant__videos-title">Watch on YouTube</span>{youtubeVideos.map((video) => <a key={video.url} href={video.url} target="_blank" rel="noopener noreferrer">{video.title}<span aria-hidden="true">↗</span></a>)}</div>}
          <form onSubmit={ask} className="shopping-assistant__form"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="e.g. spices for jollof rice" aria-label="Ask the spice guide" /><button type="submit" disabled={loading}>{loading ? "..." : "Ask"}</button></form>
        </div>
      )}
      <button className="shopping-assistant__trigger" onClick={() => setOpen((value) => !value)} aria-label="Open spice guide" title="Ask the spice guide">✦ <span>Spice guide</span></button>
    </aside>
  );
}
