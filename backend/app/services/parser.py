import os
from pypdf import PdfReader
import docx

def extract_text(file_path: str, file_type: str) -> str:
    """File ke andar se text nikalta hai."""
    text = ""
    try:
        if file_type == "pdf":
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
                    
        elif file_type == "text" and file_path.endswith('.docx'):
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
                
        elif file_type == "text" or file_type == "excel":
            # Basic text, csv, etc ke liye
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
                
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        
    return text.strip()

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Bade text ko chhote chunks mein todta hai taake AI process kar sake."""
    if not text:
        return []
        
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
        
    return chunks