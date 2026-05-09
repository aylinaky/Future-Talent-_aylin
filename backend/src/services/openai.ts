import OpenAI from "openai";

export type RoomAnalysisResult = {
  style: string;
  atmosphere: string;
  score: number;
  strengths: string[];
  improvements: string[];
  products: { name: string; searchQuery: string }[];
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function base64ToDataUrl(b64: string): string {
  const t = b64.trim();
  if (t.startsWith("iVBOR")) {
    return `data:image/png;base64,${t}`;
  }
  return `data:image/jpeg;base64,${t}`;
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    const withoutFenceStart = trimmed.replace(/^```(?:json)?\s*/i, "");
    return withoutFenceStart.replace(/\s*```$/, "").trim();
  }

  return trimmed;
}

const RESPONSE_SCHEMA_HINT = `{
  "style": "oda stili (Türkçe, kısa)",
  "atmosphere": "atmosfer açıklaması (Türkçe, 1-2 cümle)",
  "score": 0-100 arası tam sayı,
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "improvements": ["öneri 1", "öneri 2"],
  "products": [{"name": "ürün adı", "searchQuery": "İngilizce veya Türkçe arama terimi"}]
}`;

function normalizeResult(raw: unknown): RoomAnalysisResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Geçersiz model yanıtı.");
  }
  const o = raw as Record<string, unknown>;
  const style = typeof o.style === "string" ? o.style : "";
  const atmosphere = typeof o.atmosphere === "string" ? o.atmosphere : "";
  const scoreNum = Number(o.score);
  const score = Number.isFinite(scoreNum)
    ? Math.min(100, Math.max(0, Math.round(scoreNum)))
    : 0;
  const strengths = Array.isArray(o.strengths)
    ? o.strengths.filter((x): x is string => typeof x === "string")
    : [];
  const improvements = Array.isArray(o.improvements)
    ? o.improvements.filter((x): x is string => typeof x === "string")
    : [];
  const productsRaw = Array.isArray(o.products) ? o.products : [];
  const products = productsRaw
    .map((p) => {
      if (!p || typeof p !== "object") return null;
      const pr = p as Record<string, unknown>;
      const name = typeof pr.name === "string" ? pr.name : "";
      const searchQuery =
        typeof pr.searchQuery === "string" ? pr.searchQuery : "";
      if (!name && !searchQuery) return null;
      return { name, searchQuery };
    })
    .filter((x): x is { name: string; searchQuery: string } => x !== null);

  if (!style || !atmosphere) {
    throw new Error("Model yanıtında style veya atmosphere eksik.");
  }

  return { style, atmosphere, score, strengths, improvements, products };
}

export async function analyzeRoom(
  imageBase64: string
): Promise<RoomAnalysisResult> {
  const trimmed = imageBase64.trim();
  if (!trimmed) {
    throw new Error("Boş görüntü verisi.");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Sen bir iç mimarlık analistisin. Sadece geçerli JSON döndür; markdown, kod bloğu veya ek metin yok.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Bu oda fotoğrafını analiz et. Yanıtın yalnızca şu yapıda bir JSON nesnesi olsun (anahtarlar tam olarak bunlar olsun):\n" +
              RESPONSE_SCHEMA_HINT,
          },
          {
            type: "image_url",
            image_url: {
              url: base64ToDataUrl(trimmed),
            },
          },
        ],
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI boş yanıt döndü.");
  }

  const parsed = JSON.parse(extractJson(content)) as unknown;
  return normalizeResult(parsed);
}
