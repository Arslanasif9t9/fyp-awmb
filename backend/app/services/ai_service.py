import google.generativeai as genai
from ..config import get_settings

settings = get_settings()

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)
else:
    print("WARNING: GEMINI_API_KEY is not set in .env")

def generate_answer(question: str, context_chunks: list[str]) -> str:
    """AI ko sirf diye gaye context ke hisaab se jawab dene ke liye kehta hai."""
    if not settings.gemini_api_key:
        return "AI API key is missing. Please configure GEMINI_API_KEY in the backend."
    
    # Context ko format karo
    context_text = "\n\n".join([f"--- Source {i+1} ---\n{chunk}" for i, chunk in enumerate(context_chunks)])
    
    prompt = f"""You are an AI assistant for a World Model Builder. 
Your job is to answer the user's question STRICTLY based on the provided context.
Do NOT use outside knowledge. If the answer is not in the context, say "I cannot find the answer in the stored evidence."

Context:
{context_text}

User Question: {question}

Answer:"""

    try:
        # Gemini 1.5 Flash fast aur free tier ke liye best hai
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI Error: {str(e)}"