import OpenAI from "openai";

export type RoomAnalysisResult = {
  style: string;
  atmosphere: string;
  score: number;
  colorPalette: string[];
  strengths: string[];
  improvements: string[];
  products: { name: string; searchQuery: string }[];
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractJson(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    const withoutFenceStart = trimmed.replace(/^```(?:json)?\s*/i, "");
    return withoutFenceStart.replace(/\s*```$/, "").trim();
  }

  return trimmed;
}

export async function analyzeRoom(
  imageBase64: string
): Promise<RoomAnalysisResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an interior design analyst. Return only valid JSON with no markdown or extra text.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Analyze this room photo and return only this JSON shape: " +
                "{ style: string, atmosphere: string, score: number, colorPalette: string[], strengths: string[], improvements: string[], products: { name: string, searchQuery: string }[] }",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned empty content.");
    }

    const parsed = JSON.parse(extractJson(content)) as RoomAnalysisResult;
    return parsed;
  } catch (error) {
    console.error("OpenAI room analysis failed:", error);
    throw new Error("Failed to analyze room image with OpenAI.");
  }
}
