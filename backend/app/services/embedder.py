from sentence_transformers import SentenceTransformer

# Ye model free hai aur local chalta hai (384 dimensions)
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> list[float]:
    """Text ko vector (numbers) mein convert karta hai."""
    if not text.strip():
        return []
    embedding = model.encode(text)
    return embedding.tolist()