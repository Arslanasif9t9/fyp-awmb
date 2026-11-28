import asyncio
import json
import re
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
    if not gemini_client: return None
    try:
        response = gemini_client.models.generate_content(
            model='gemini-3.8-flash', # Model name fixed
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"[AI] Gemini failed: {e}")
        return None


def _try_groq(prompt):
    if not groq_client: return None
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
    prompt = _build_prompt(question, context_chunks)
    try:
        result = await asyncio.wait_for(asyncio.to_thread(_try_gemini, prompt), timeout=20.0)
        if result: return result
    except asyncio.TimeoutError: pass
    
    try:
        result = await asyncio.wait_for(asyncio.to_thread(_try_groq, prompt), timeout=25.0)
        if result: return result
    except asyncio.TimeoutError: pass
    
    return "Both AI services are unavailable right now. Please try again."


# --- JSON Extraction Helpers ---
def _clean_json_response(text: str) -> str:
    """Removes markdown blocks and extracts the JSON string."""
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return match.group(0)
    return "{}"

async def extract_entities_and_relations(text_chunk: str) -> dict:
    prompt = f"""Extract entities and relations from the text below.
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{{
  "entities": [{{"name": "Entity Name", "type": "Person|Organization|Location|Concept"}}],
  "relations": [{{"source": "Entity 1", "target": "Entity 2", "relation": "verb_phrase"}}]
}}

Text: {text_chunk}
"""
    result_text = ""
    try:
        result_text = await asyncio.wait_for(asyncio.to_thread(_try_gemini, prompt), timeout=15.0)
    except: pass
    
    if not result_text:
        try:
            result_text = await asyncio.wait_for(asyncio.to_thread(_try_groq, prompt), timeout=15.0)
        except: pass

    if not result_text: return {"entities": [], "relations": []}

    try:
        clean_json = _clean_json_response(result_text)
        return json.loads(clean_json)
    except Exception as e:
        print(f"JSON Parse Error in Extraction: {e} | Raw: {result_text[:100]}")
        return {"entities": [], "relations": []}


async def check_contradiction(chunk1: str, chunk2: str) -> dict:
    prompt = f"""Do these two text chunks contradict each other regarding facts, numbers, or claims?
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{{
  "is_contradiction": true,
  "explanation": "Brief reason why they contradict."
}}
If there is NO contradiction, return: {{"is_contradiction": false, "explanation": "No contradiction"}}

Chunk 1: {chunk1}
Chunk 2: {chunk2}
"""
    result_text = ""
    try:
        result_text = await asyncio.wait_for(asyncio.to_thread(_try_gemini, prompt), timeout=15.0)
    except: pass
    
    if not result_text:
        try:
            result_text = await asyncio.wait_for(asyncio.to_thread(_try_groq, prompt), timeout=15.0)
        except: pass

    if not result_text: return {"is_contradiction": False}

    try:
        clean_json = _clean_json_response(result_text)
        return json.loads(clean_json)
    except Exception as e:
        print(f"JSON Parse Error in Contradiction: {e}")
        return {"is_contradiction": False}