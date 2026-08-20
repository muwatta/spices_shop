import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const INTENT_TERMS: Record<string, string[]> = {
  jollof: ["curry", "pepper", "ginger", "garlic", "seasoning"],
  rice: ["curry", "pepper", "ginger", "garlic", "seasoning"],
  grill: ["suya", "pepper", "rosemary", "thyme", "seasoning"],
  chicken: ["curry", "thyme", "rosemary", "paprika", "seasoning"],
  soup: ["pepper", "ginger", "garlic", "thyme"],
  spicy: ["pepper", "chili", "cayenne", "scotch", "shombo"],
  sweet: ["cinnamon", "nutmeg", "honey"],
  herb: ["thyme", "rosemary", "oregano", "bay", "curry"],
};

function fallbackReply(message: string, products: any[]) {
  const normalized = message.toLowerCase();
  const words = normalized.split(/\s+/).filter((word) => word.length > 2);
  const intentTerms = Object.entries(INTENT_TERMS)
    .filter(([intent]) => normalized.includes(intent))
    .flatMap(([, terms]) => terms);
  const terms = [...new Set([...words, ...intentTerms])];
  const matches = products.map((product) => {
    const text = `${product.name} ${product.description ?? ""} ${product.category ?? ""}`.toLowerCase();
    const score = terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
    return { product, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map(({ product }) => product);
  const suggestions = matches.length ? matches : products.filter((product) => product.stock === null || product.stock > 0).slice(0, 4);
  const videoQueries = [`how to cook ${message}`, `${message} recipe Nigerian cooking`];
  return {
    reply: suggestions.length
      ? `Based on your request, these ${suggestions.length === 1 ? "options is" : "options are"} available now. Tell me more about the meal or flavour and I will narrow it down.`
      : "I could not find an available match right now. Try another ingredient or meal.",
    products: suggestions,
    youtubeVideos: videoQueries.map((query) => ({
      title: `${query.replace(/\b\w/g, (letter) => letter.toUpperCase())} videos`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    })),
  };
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to use the Spice Guide." }, { status: 401 });

  const body = await request.json();
  const message = String(body.message ?? "").trim().slice(0, 500);
  if (!message) return NextResponse.json({ error: "Tell me what you want to cook or find." }, { status: 400 });

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, stock, category")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const catalog = (products ?? []).filter((product) => product.stock === null || product.stock > 0);
  const localFallback = fallbackReply(message, catalog);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json(localFallback);

  const catalogForModel = catalog.map(({ id, name, description, price, stock, category }) => ({ id, name, description, price, stock, category }));
  const prompt = `You are KMA Spices' private shopping advisor. Help a signed-in customer choose products for cooking.
Rules:
- Recommend only products from the catalog below. Never invent products, prices, stock, health claims, or availability.
- Prefer 1 to 4 products and explain briefly why each fits the customer's request.
- Give practical cooking guidance, ask one useful follow-up question when the request is vague, and stay concise.
- Return valid JSON only: {"reply":"string","productIds":["catalog id"],"reasons":["short reason per product"],"youtubeQueries":["search phrase"]}.
Customer request: ${message}
Catalog: ${JSON.stringify(catalogForModel)}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 500 },
      }),
    });
    if (!response.ok) return NextResponse.json(localFallback);
    const result = await response.json();
    const parsed = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}");
    const ids = new Set(Array.isArray(parsed.productIds) ? parsed.productIds : []);
    const recommended = catalog.filter((product) => ids.has(product.id)).slice(0, 4);
    const youtubeQueries = Array.isArray(parsed.youtubeQueries)
      ? parsed.youtubeQueries.map((query: unknown) => String(query).trim()).filter(Boolean).slice(0, 2)
      : localFallback.youtubeVideos.map((video) => video.title.replace(/ videos$/, ""));
    return NextResponse.json({
      reply: String(parsed.reply || localFallback.reply),
      products: recommended,
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 4) : [],
      youtubeVideos: youtubeQueries.map((query: string) => ({
        title: `${query.replace(/\b\w/g, (letter) => letter.toUpperCase())} videos`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      })),
    });
  } catch {
    return NextResponse.json(localFallback);
  }
}
