const SERPAPI_SEARCH_URL = "https://serpapi.com/search.json";

export type ShoppingProduct = {
  name: string;
  price: string;
  link: string;
  imageUrl: string;
  store: string;
};

type SerpShoppingResult = {
  title?: string;
  price?: string;
  extracted_price?: number;
  link?: string;
  product_link?: string;
  serpapi_link?: string;
  thumbnail?: string;
  source?: string;
};

function resolveLink(r: SerpShoppingResult): string {
  if (typeof r.link === "string" && r.link.trim()) {
    return r.link.trim();
  }
  if (typeof r.product_link === "string" && r.product_link.trim()) {
    return r.product_link.trim();
  }
  if (typeof r.serpapi_link === "string" && r.serpapi_link.trim()) {
    return r.serpapi_link.trim();
  }
  return "";
}

type SerpApiJson = {
  shopping_results?: SerpShoppingResult[];
  error?: string;
};

function mapResult(r: SerpShoppingResult): ShoppingProduct | null {
  const name = typeof r.title === "string" ? r.title.trim() : "";
  const priceRaw = r.price;
  const price =
    typeof priceRaw === "string"
      ? priceRaw.trim()
      : priceRaw != null
        ? String(priceRaw)
        : "";
  const link = resolveLink(r);
  const imageUrl =
    typeof r.thumbnail === "string" ? r.thumbnail.trim() : "";
  const store = typeof r.source === "string" ? r.source.trim() : "";

  if (!name || !link) {
    return null;
  }

  return {
    name,
    price: price || "—",
    link,
    imageUrl,
    store: store || "—",
  };
}

function sortByPriceAsc(items: ShoppingProduct[], raw: SerpShoppingResult[]) {
  const priceByLink = new Map<string, number>();
  for (const r of raw) {
    const link = resolveLink(r);
    if (!link) continue;
    const n =
      typeof r.extracted_price === "number" && Number.isFinite(r.extracted_price)
        ? r.extracted_price
        : NaN;
    if (!Number.isNaN(n)) {
      priceByLink.set(link, n);
    }
  }

  return [...items].sort((a, b) => {
    const pa = priceByLink.get(a.link) ?? Number.POSITIVE_INFINITY;
    const pb = priceByLink.get(b.link) ?? Number.POSITIVE_INFINITY;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });
}

/**
 * SerpAPI Google Shopping: ilk 5 ürün, ucuzdan pahalıya.
 */
export async function searchProduct(query: string): Promise<{
  products: ShoppingProduct[];
  /** SerpAPI JSON gövdesi (parse edilmiş). */
  raw: unknown;
}> {
  const apiKey = process.env.SERPAPI_KEY?.trim();
  if (!apiKey) {
    throw new Error("SERPAPI_KEY ortam değişkeni tanımlı değil.");
  }

  const q = query.trim();
  if (!q) {
    return { products: [], raw: null };
  }

  const params = new URLSearchParams({
    engine: "google_shopping",
    q,
    api_key: apiKey,
    sort_by: "1",
  });

  const res = await fetch(`${SERPAPI_SEARCH_URL}?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  let json: SerpApiJson;
  try {
    json = text ? (JSON.parse(text) as SerpApiJson) : {};
  } catch {
    throw new Error("SerpAPI yanıtı JSON değil.");
  }

  if (!res.ok) {
    const err =
      typeof json.error === "string" ? json.error : `SerpAPI HTTP ${res.status}`;
    throw new Error(err);
  }

  if (typeof json.error === "string" && json.error) {
    throw new Error(json.error);
  }

  const rows = Array.isArray(json.shopping_results) ? json.shopping_results : [];
  const mapped = rows
    .map((r) => mapResult(r))
    .filter((x): x is ShoppingProduct => x !== null);

  const sorted = sortByPriceAsc(mapped, rows);
  return { products: sorted.slice(0, 5), raw: json };
}
