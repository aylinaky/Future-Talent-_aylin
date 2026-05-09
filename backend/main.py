from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    imageBase64: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/analyze")
def analyze_room(request: AnalyzeRequest):
    return {
        "style": "Warm Minimalism",
        "atmosphere": "Calm, cozy and slightly unfinished",
        "score": 78,
        "colorPalette": ["Warm white", "Beige", "Light wood", "Soft grey"],
        "strengths": [
            "The room has a calm base color palette.",
            "Natural light creates a soft atmosphere."
        ],
        "improvements": [
            "Add a warm table lamp for layered lighting.",
            "Use a textured rug to make the room feel more complete.",
            "Add one framed print to create a focal point."
        ],
        "products": [
            {
                "name": "Warm LED Table Lamp",
                "searchQuery": "warm LED table lamp beige"
            },
            {
                "name": "Textured Beige Rug",
                "searchQuery": "textured beige rug small room"
            }
        ]
    }