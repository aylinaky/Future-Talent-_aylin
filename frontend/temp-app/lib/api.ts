const API_BASE_URL = "http://192.168.1.144:3000/api";

export type RoomAnalysis = {
  style: string;
  atmosphere: string;
  score: number;
  colorPalette: string[];
  strengths: string[];
  improvements: string[];
  products: {
    name: string;
    searchQuery: string;
  }[];
};

export async function analyzeRoom(imageBase64: string): Promise<RoomAnalysis> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    throw new Error("Room analysis failed");
  }

  return response.json();
}