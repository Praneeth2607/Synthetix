# Synthetix: The Ultimate Academic Synthesis Engine 🚀

A full-stack, multimodal AI assistant designed to enhance student productivity. Synthetix allows students to drag and drop their study materials (PDFs, Notes) and instantly generate high-quality Concept Posters, interactive Flash Revision Decks, and active-recall Knowledge Probes using advanced AI.

## Features ✨
- **Multimodal Synthesis**: Uses `Navigate Labs AI` to parse text and automatically generate educational images simultaneously.
- **Premium User Interface**: Built with Next.js & Tailwind CSS v4, featuring glassmorphism design, vibrant gradients, and fluid micro-animations.
- **Advanced Synthesis Controls**: Fine-tune your generation tokens by disabling specific modules or adjusting the exact number of Flashcards and Quiz questions generated.
- **Active Knowledge Probe**: An interactive quiz module that doesn't just show answers, but forces you to submit your choices and actively verifies them for enhanced memory retention.

---

## Tech Stack
*   **Frontend**: Next.js 15, React, Tailwind CSS v4, Framer Motion, Lucide React, Axios.
*   **Backend**: Python, FastAPI, Uvicorn, OpenAI Python Client, PyPDF.
*   **AI Models**: `gpt-4.1-nano` (Knowledge Engine), `imagen-4.0-generate-001` (Visuals Engine).

---

## Setup & Run Instructions

This project is split into two directories: `synthetix-api` (Backend) and `synthetix-web` (Frontend). Follow these steps to run the servers locally.

### 1. Start the FastAPI Backend
Open a terminal in the root directory and run:

```bash
cd synthetix-api

# Create a virtual environment if you haven't yet:
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn openai python-multipart pypdf pillow python-dotenv

# Start the Backend Server
python -m uvicorn main:app --reload
```
*The backend API will run on **http://localhost:8000**.*

### 2. Configure Environment Variables
Before making requests, ensure you have set up your API keys in the backend directory.
1. Navigate to `/synthetix-api`
2. Copy `.env.example` and rename it to `.env`.
3. Fill in your `NAVIGATE_API_KEY`. (Note: The `.env` file is excluded from git tracking for security).

### 3. Start the Next.js Frontend
Open a **new** terminal in the root directory and run:

```bash
cd synthetix-web

# Install all node_modules dependencies
npm install

# Start the Frontend Development Server
npm run dev
```
*The Synthetix Dashboard will run on **http://localhost:3000**.*

---

## Usage
1. Navigate your web browser to `http://localhost:3000`.
2. Drop a PDF document or type your study notes into the **Input Nexus**.
3. Toggle the **Synthesis Modules** you want to generate.
4. Click **Ignite Synthesis** and watch the AI process your material into visual diagrams, succinct notes, and a test quiz!
