import { Request, Response, Router } from "express";

const mockAnalysis = {
  style: "Warm Minimalism",
  atmosphere: "Calm, cozy and slightly unfinished",
  score: 78,
  colorPalette: ["Warm white", "Beige", "Light wood", "Soft grey"],
  strengths: [
    "The room has a calm base color palette.",
    "Natural light creates a soft atmosphere."
  ],
  improvements: [
    "Add a warm table lamp for layered lighting.",
    "Use a textured rug to make the room feel more complete.",
    "Add one framed print to create a focal point."
  ],
  products: [
    {
      name: "Warm LED Table Lamp",
      searchQuery: "warm LED table lamp beige"
    },
    {
      name: "Textured Beige Rug",
      searchQuery: "textured beige rug small room"
    }
  ]
};

const router = Router();

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    if (process.env.USE_MOCK_AI === "true") {
      return res.json(mockAnalysis);
    }

    return res.json(mockAnalysis);
  } catch (error) {
    console.error("Analyze API error:", error);
    return res.status(500).json({ error: "Oda analizi yapılamadı." });
  }
});

export default router;