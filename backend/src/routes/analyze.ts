import { Request, Response, Router } from "express";
import type { ShoppingProduct } from "../services/serpapi";
import { searchProduct } from "../services/serpapi";

/** İstemci yanıtı: mesaj + cause zinciri (stack sadece sunucu logunda). */
function errorMessageForClient(error: unknown): string {
  if (error instanceof Error) {
    const parts = [error.message];
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
      parts.push(`Cause: ${cause.message}`);
    } else if (cause !== undefined && cause !== null) {
      try {
        parts.push(`Cause: ${JSON.stringify(cause)}`);
      } catch {
        parts.push(`Cause: ${String(cause)}`);
      }
    }
    return parts.join(" | ");
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

const MOCK_RESPONSE = {
  success: true as const,
  data: {
    style: "Warm Minimal",
    atmosphere: "Quiet morning light, raw textures, a touch of clay.",
    score: 82,
    strengths: [
      "Doğal ışık kullanımı çok başarılı",
      "Renk uyumu tutarlı ve sakin",
      "Mobilya yerleşimi dengeli",
    ],
    improvements: [
      "Doku çeşitliliği artırılabilir",
      "Bir köşeye bitki eklenebilir",
      "Yumuşak aydınlatma eklenebilir",
    ],
    products: [
      { name: "Hasır Yer Minderi", searchQuery: "hasır yer minderi naturel" },
      { name: "Pampas Otu", searchQuery: "pampas otu dekoratif" },
      { name: "Bej Keten Yastık", searchQuery: "keten yastık bej minimal" },
    ],
  },
};

const router = Router();

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const imageBase64 = req.body?.imageBase64;

    if (imageBase64 == null || typeof imageBase64 !== "string") {
      return res.status(400).json({
        success: false,
        error: "imageBase64 alanı zorunludur ve string olmalıdır.",
      });
    }

    if (!process.env.SERPAPI_KEY?.trim()) {
      return res.status(500).json({
        success: false,
        error: "SERPAPI_KEY ortam değişkeni tanımlı değil.",
      });
    }

    const { products: productQueries, ...analysisRest } = MOCK_RESPONSE.data;

    const merged: ShoppingProduct[] = [];
    for (const item of productQueries) {
      try {
        const { products: found, raw } = await searchProduct(item.searchQuery);
        console.log(
          "[SerpAPI ham yanıt]",
          item.searchQuery,
          JSON.stringify(raw, null, 2)
        );
        merged.push(...found);
      } catch (err) {
        console.error("SerpAPI searchProduct failed:", item.searchQuery, err);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ...analysisRest,
        products: merged,
      },
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return res
      .status(500)
      .json({ success: false, error: errorMessageForClient(error) });
  }
});

export default router;
