const ANALYZE_URL = "http://192.168.1.144:3000/api/analyze";

export type AnalyzeRoomResponse = {
  style: string;
  atmosphere: string;
  score: number;
  strengths: string[];
  improvements: string[];
  colorPalette?: string[];
  products?: Array<{
    name: string;
    price?: string;
    link?: string;
    imageUrl?: string;
    store?: string;
    searchQuery?: string;
  }>;
};

function isAnalyzePayload(x: unknown): x is AnalyzeRoomResponse {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.style === "string" &&
    typeof o.atmosphere === "string" &&
    typeof o.score === "number" &&
    Array.isArray(o.strengths) &&
    Array.isArray(o.improvements)
  );
}

export async function analyzeRoom(
  imageBase64: string
): Promise<AnalyzeRoomResponse> {
  const res = await fetch(ANALYZE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ imageBase64 }),
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const msg =
      parsed &&
      typeof parsed === "object" &&
      "error" in parsed &&
      typeof (parsed as { error: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : text || `İstek başarısız (${res.status})`;
    throw new Error(msg);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Sunucudan geçersiz yanıt alındı.");
  }

  const body = parsed as Record<string, unknown>;

  if (body.success === false) {
    const err =
      typeof body.error === "string" ? body.error : "Analiz başarısız.";
    throw new Error(err);
  }

  if (body.success === true && body.data != null && isAnalyzePayload(body.data)) {
    return body.data;
  }

  if (isAnalyzePayload(parsed)) {
    return parsed;
  }

  throw new Error("Sunucudan geçersiz yanıt alındı.");
}
