export type ProductSuggestion = {
    name: string;
    searchQuery: string;
  };
  
  export type RoomAnalysis = {
    style: string;
    atmosphere: string;
    score: number;
    colorPalette: string[];
    strengths: string[];
    improvements: string[];
    products: ProductSuggestion[];
  };