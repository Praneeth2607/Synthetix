import os
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
    files: List[UploadFile] = File(None),
    generate_poster: bool = Form(True),
    generate_summary: bool = Form(True),
    generate_quiz: bool = Form(True),
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

    # 1. Generate text summaries/quizzes/poster_prompt using GPT-4.1-nano
    synthesis_data = {}
    
    if generate_summary or generate_quiz or generate_poster:
        instructions = ""
        json_structure = {}
        
        if generate_summary:
            instructions += f"\n- A clear, concise {num_summary}-point revision summary."
            json_structure["summary"] = ["point1", "point2", "..."]
        if generate_quiz:
            instructions += f"\n- A set of {num_quiz} challenging MCQ questions with answers."
            json_structure["quiz"] = [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "..."}]
        if generate_poster:
            instructions += "\n- A creative prompt for an AI image generator to create a visual 'Concept Poster' for this topic."
            json_structure["poster_prompt"] = "..."
            
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
            synthesis_data = eval(text_response.choices[0].message.content) # Simple parser for demo
        except Exception as e:
            # Fallback if AI output isn't clean
            import json
            try:
                synthesis_data = json.loads(text_response.choices[0].message.content)
            except:
                raise HTTPException(status_code=500, detail=f"AI Synthesis failed: {str(e)}")

    # 2. Generate the Concept Poster using Imagen
    poster_url = None
    if generate_poster and "poster_prompt" in synthesis_data:
        try:
            image_response = AI_CLIENT.images.generate(
                model=IMAGE_MODEL,
                prompt=f"Educational infographic poster for: {synthesis_data['poster_prompt']}. Professional, 4k, digital art style.",
                n=1,
                size="1024x1024",
                response_format="b64_json"
            )
            poster_url = f"data:image/png;base64,{image_response.data[0].b64_json}"
        except Exception as e:
            poster_url = None # Optional fallback

    return {
        "summary": synthesis_data.get("summary"),
        "quiz": synthesis_data.get("quiz"),
        "poster_url": poster_url
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
