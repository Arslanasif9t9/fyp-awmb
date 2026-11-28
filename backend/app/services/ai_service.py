import asyncio
from google import genai
from groq import Groq
from ..config import get_settings

settings = get_settings()

gemini_client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None
groq_client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None


def _build_prompt(question, context_chunks):
    context_text = "\n\n".join([f"--- Source {i+1} ---\n{chunk}" for i, chunk in enumerate(context_chunks)])
    return f"""You are an AI assistant for a World Model Builder.
Your job is to answer the user's question STRICTLY based on the provided context.
Do NOT use outside knowledge. If the answer is not in the context, say "I cannot find the answer in the stored evidence."

Context:
{context_text}

User Question: {question}

Answer:"""


def _try_gemini(prompt):
    if not gemini_client:
        return None
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"[AI] Gemini failed: {e}")
        return None


def _try_groq(prompt):
    if not groq_client:
        return None
    try:
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[AI] Groq failed: {e}")
        return None


async def generate_answer_async(question, context_chunks):
    """Async with hard timeout - never hangs the backend."""
    prompt = _build_prompt(question, context_chunks)

    # Try Gemini with 20s hard timeout
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(_try_gemini, prompt),
            timeout=20.0
        )
        if result:
            print("[AI] Gemini responded successfully")
            return result
    except asyncio.TimeoutError:
        print("[AI] Gemini timed out after 20s - falling back to Groq")
    except Exception as e:
        print(f"[AI] Gemini error: {e}")

    # Fallback to Groq with 25s timeout
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(_try_groq, prompt),
            timeout=25.0
        )
        if result:
            print("[AI] Groq responded successfully")
            return result
    except asyncio.TimeoutError:
        print("[AI] Groq timed out after 25s")
    except Exception as e:
        print(f"[AI] Groq error: {e}")

    return "Both AI services are unavailable right now. Please try again in a moment."





import json
import re

async def extract_entities_and_relations(text_chunk: str) -> dict:
    """AI se text ke andar se entities aur relations nikalwata hai."""
    prompt = f"""Extract entities and relations from the text below.
Return ONLY a valid JSON object with this exact structure:
{{
  "entities": [{{"name": "Entity Name", "type": "Person|Organization|Location|Concept"}}],
  "relations": [{{"source": "Entity 1", "target": "Entity 2", "relation": "verb_phrase"}}]
}}

Text: {text_chunk}
"""
    
    # Try Gemini, fallback to Groq
    result_text = ""
    if gemini_client:
        try:
            response = await asyncio.to_thread(
                gemini_client.models.generate_content,
                model='gemini-2.0-flash',
                contents=prompt
            )
            result_text = response.text
        except Exception as e:
            print(f"Gemini extraction failed: {e}")

    if not result_text and groq_client:
        try:
            response = await asyncio.to_thread(
                groq_client.chat.completions.create,
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
            )
            result_text = response.choices[0].message.content
        except Exception as e:
            print(f"Groq extraction failed: {e}")

    # JSON parse karo (AI kabhi kabhi markdown ```json laga deta hai)
    try:
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
    except Exception as e:
        print(f"JSON Parse Error: {e}")
    
    return {"entities": [], "relations": []}