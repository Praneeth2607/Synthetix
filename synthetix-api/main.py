import os
import re
import base64
import io
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
from PIL import Image
import pypdf
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="Synthetix API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Navigate Labs Configuration
api_key = os.getenv("NAVIGATE_API_KEY")
base_url = os.getenv("NAVIGATE_BASE_URL")

if not api_key or not base_url:
    raise RuntimeError("Missing Navigate Labs credentials. Ensure .env file is configured!")

AI_CLIENT = openai.OpenAI(
    api_key=api_key,
    base_url=base_url
)

CHAT_MODEL = "gpt-4.1-nano"
IMAGE_MODEL = "imagen-4.0-generate-001"

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
db: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

@app.get("/")
async def root():
    return {"status": "Synthetix API is online"}

def extract_text_from_pdf(file_bytes):
    pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

@app.post("/synthesize")
async def synthesize(
    text: Optional[str] = Form(None),
    query: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    access_token: Optional[str] = Form(None),
    files: List[UploadFile] = File(None),
    generate_graph: bool = Form(True),
    generate_summary: bool = Form(True),
    generate_quiz: bool = Form(True),
    generate_audio: bool = Form(True),
    num_summary: int = Form(5),
    num_quiz: int = Form(3)
):
    combined_content = text or ""
    
    # Process uploaded files
    if files:
        for file in files:
            content = await file.read()
            if file.content_type == "application/pdf":
                combined_content += "\n" + extract_text_from_pdf(content)
            elif file.content_type.startswith("image/"):
                # For images, we can either use vision models or simple OCR
                # Since we want "premium", let's assume we can describe diagrams or notes
                # For now, we'll label it in the prompt
                combined_content += f"\n[Attached Image: {file.filename}]"

    if not combined_content:
        raise HTTPException(status_code=400, detail="No content provided for synthesis.")

    # 1. Generate text summaries/quizzes/graph using GPT-4.1-nano
    synthesis_data = {}
    
    if generate_summary or generate_quiz or generate_graph or generate_audio:
        instructions = ""
        json_structure = {}
        
        if query:
            match = re.search(r'(\d+)\s*mark', query, re.IGNORECASE)
            if match:
                marks = match.group(1)
                instructions += f"\n- Focus the entire output on answering and exploring this specific query based on the document: '{query}'. Provide a highly detailed, structured response explicitly tailored to score full marks for a {marks}-mark university/college question. Include exactly {marks} distinct points or equivalent comprehensive depth to maximize points."
            else:
                instructions += f"\n- Focus the entire output on answering and exploring this specific query based on the document: '{query}'."
            json_structure["query_answer"] = "Direct answer to the query..."
            
        if generate_summary:
            instructions += f"\n- A clear, concise {num_summary}-point revision summary."
            json_structure["summary"] = ["point1", "point2", "..."]
        if generate_quiz:
            instructions += f"\n- A set of {num_quiz} challenging MCQ questions with answers."
            json_structure["quiz"] = [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "..."}]
        if generate_graph:
            instructions += "\n- A knowledge graph depicting the main concepts and their relationships."
            json_structure["knowledge_graph"] = {
                "nodes": [{"id": "1", "label": "Concept Name"}],
                "edges": [{"source": "1", "target": "2", "label": "Relationship"}]
            }
        
        if generate_audio:
            word_count = len(combined_content.split())
            if word_count < 500:
                instructions += "\n- Generate a ~1 minute short, engaging audio podcast script summarizing the core concepts (approx 150 words)."
            elif word_count < 2000:
                instructions += "\n- Generate a ~3 minute detailed audio podcast script explaining the nuances of the text like an enthusiastic radio host (approx 450 words)."
            else:
                instructions += "\n- Generate a comprehensive ~5 minute engaging podcast script exploring the depth of the text, acting as an expert academic tutor speaking to a student (approx 750 words)."
            json_structure["podcast_script"] = "Script text..."
            
        import json
        synthesis_prompt = f"""
        You are an expert academic tutor. Synthesize the following study material into:
        {instructions}

        Material:
        {combined_content[:4000]} 

        Return the result in strict JSON format:
        {json.dumps(json_structure, indent=2)}
        """
        
        try:
            text_response = AI_CLIENT.chat.completions.create(
                model=CHAT_MODEL,
                messages=[{"role": "user", "content": synthesis_prompt}],
                response_format={ "type": "json_object" }
            )
            
            content = text_response.choices[0].message.content
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = re.sub(r'^```json\s*|```$', '', content.strip(), flags=re.MULTILINE)
            synthesis_data = json.loads(content)
        except Exception as e:
            print(f"JSON Parse Error: {e}")
            raise HTTPException(status_code=500, detail=f"AI Synthesis failed to parse JSON: {str(e)}")

        audio_base64 = None
        podcast_error = None
        if generate_audio and synthesis_data.get("podcast_script"):
            try:
                # Use a specific try block for TTS to capture exact failure reason
                tts_resp = AI_CLIENT.audio.speech.create(
                    model="gpt-4o-mini-tts",
                    voice="onyx",
                    input=synthesis_data["podcast_script"][:4080]
                )
                audio_base64 = base64.b64encode(tts_resp.content).decode("utf-8")
            except Exception as e:
                podcast_error = str(e)
                print(f"TTS Error: {e}")

    user_db = db
    if access_token and supabase_url and supabase_key:
        from supabase import ClientOptions
        user_db = create_client(supabase_url, supabase_key, options=ClientOptions(headers={'Authorization': f'Bearer {access_token}'}))

    if user_db and user_id:
        try:
            # Create document
            doc_data = user_db.table("documents").insert({
                "user_id": user_id,
                "title": files[0].filename if (files and getattr(files[0], "filename", None)) else "Direct Note Input",
                "raw_content": combined_content
            }).execute()
            
            if doc_data.data:
                doc_id = doc_data.data[0]["id"]
                
                # Save synthesis
                user_db.table("syntheses").insert({
                    "document_id": doc_id,
                    "user_id": user_id,
                    "query": query,
                    "query_answer": synthesis_data.get("query_answer"),
                    "summary": synthesis_data.get("summary"),
                    "quiz": synthesis_data.get("quiz"),
                    "knowledge_graph": synthesis_data.get("knowledge_graph")
                }).execute()
        except Exception as e:
            print(f"Database save error: {e}")

    return {
        "query_answer": synthesis_data.get("query_answer"),
        "summary": synthesis_data.get("summary"),
        "quiz": synthesis_data.get("quiz"),
        "knowledge_graph": synthesis_data.get("knowledge_graph"),
        "podcast_script": synthesis_data.get("podcast_script"),
        "audio_base64": audio_base64 if 'audio_base64' in locals() else None,
        "podcast_error": podcast_error if 'podcast_error' in locals() else None
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    response = AI_CLIENT.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": "You are Synthetix, a smart multimodal student assistant. Help the user understand their material better."},
            {"role": "user", "content": f"Context: {request.context}\n\nQuestion: {request.message}"}
        ]
    )
    return {"reply": response.choices[0].message.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
