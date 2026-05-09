---
description: 
alwaysApply: true
---

---
description: 
alwaysApply: true
---

# NOOK API
Oda fotoğraflarını AI ile analiz eden backend.

Endpointler:
- POST /api/analyze → fotoğraf alır, OpenAI Vision analiz eder
- POST /api/products → SerpAPI ile ürün fiyatı arar

Env değişkenleri:
OPENAI_API_KEY, SERPAPI_KEY, SUPABASE_URL, PORT=3000
