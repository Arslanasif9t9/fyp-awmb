import time
from google import genai
from ..config import get_settings

settings = get_settings()

client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None

def generate_answer(question: str, context_chunks: list[str]) -> str:
    """AI ko sirf diye gaye context ke hisaab se jawab dene ke liye kehta hai."""
    if not client:
        return "AI API key is missing. Please configure GEMINI_API_KEY in the backend."
    
    context_text = "\n\n".join([f"--- Source {i+1} ---\n{chunk}" for i, chunk in enumerate(context_chunks)])
    
    prompt = f"""You are an AI assistant for a World Model Builder. 
Your job is to answer the user's question STRICTLY based on the provided context.
Do NOT use outside knowledge. If the answer is not in the context, say "I cannot find the answer in the stored evidence."

Context:
{context_text}

User Question: {question}

Answer:"""

    # Retry Logic: Agar 503 (Busy) aaye to 3 baar tak koshish karo
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=prompt
            )
            return response.text
        except Exception as e:
            error_str = str(e)
            # Agar error 503/429/UNAVAILABLE hai to wait karke retry karo
            if ('503' in error_str or '429' in error_str or 'UNAVAILABLE' in error_str):
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 3  # 3, 6 seconds
                    print(f"[AI] Busy, retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
            return f"AI Error: {str(e)}"
    
    return "AI service is temporarily busy. Please try again in a few seconds."