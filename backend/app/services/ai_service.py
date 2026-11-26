from google import genai
from groq import Groq
from ..config import get_settings

settings = get_settings()

gemini_client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None
groq_client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None

def generate_answer_stream(question: str, context_chunks: list[str]):
    """AI se live stream (yield) karta hai. Pehle Gemini, fail ho to Groq."""
    
    context_text = "\n\n".join([f"--- Source {i+1} ---\n{chunk}" for i, chunk in enumerate(context_chunks)])
    
    prompt = f"""You are an AI assistant for a World Model Builder. 
Your job is to answer the user's question STRICTLY based on the provided context.
Do NOT use outside knowledge. If the answer is not in the context, say "I cannot find the answer in the stored evidence."

Context:
{context_text}

User Question: {question}

Answer:"""

    # 1. Try Gemini First (Streaming)
    if gemini_client:
        try:
            response = gemini_client.models.generate_content_stream(
                model='gemini-3.8-flash',
                contents=prompt
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
            return # Agar Gemini chal gaya, to yahin se wapas
        except Exception as e:
            print(f"Gemini failed: {e}. Falling back to Groq...")

    # 2. Fallback to Groq (Streaming)
    if groq_client:
        try:
            # Llama 3.3 70B Groq par sab se fast aur best free model hai
            response = groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
            return
        except Exception as e:
            yield f"\n\n**AI Error:** Both Gemini and Groq failed. ({str(e)})"
            return

    yield "\n\n**AI Error:** No API keys configured."