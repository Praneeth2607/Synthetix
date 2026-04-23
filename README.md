# Synthetix: The Ultimate Academic Synthesis Engine 🚀

A full-stack, multimodal AI assistant designed to enhance student productivity. Synthetix allows students to drag and drop their study materials (PDFs, Notes) and instantly generate high-quality Concept Posters, interactive Flash Revision Decks, and active-recall Knowledge Probes using advanced AI.

## Features ✨
- **Multimodal Synthesis**: Uses `Navigate Labs AI` to parse text and automatically generate educational images simultaneously.
- **Premium User Interface**: Built with Next.js & Tailwind CSS v4, featuring glassmorphism design, vibrant gradients, and fluid micro-animations.
- **Advanced Synthesis Controls**: Fine-tune your generation tokens by disabling specific modules or adjusting the exact number of Flashcards and Quiz questions generated.
- **Active Knowledge Probe**: An interactive quiz module that doesn't just show answers, but forces you to submit your choices and actively verifies them for enhanced memory retention.

---

## Project Structure 📁

This project is organized as a monorepo containing both the frontend and backend services:

- **`synthetix-web/`**: The Next.js frontend application.
- **`synthetix-api/`**: The FastAPI backend service.

---

## Tech Stack 🛠️

*   **Frontend**: Next.js 15, React, Tailwind CSS v4, Framer Motion, Lucide React, Axios.
*   **Backend**: Python, FastAPI, Uvicorn, OpenAI Python Client, PyPDF.
*   **AI Models**: `gpt-4.1-nano` (Knowledge Engine), `imagen-4.0-generate-001` (Visuals Engine).

---

## Setup & Run Instructions 🚀

Follow these steps to run the servers locally.

### 1. Start the FastAPI Backend
Open a terminal in the root directory:

```bash
cd synthetix-api

# Create and activate a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Backend Server
python -m uvicorn main:app --reload
```
*The backend API will run on **http://localhost:8000**.*

### 2. Configure Environment Variables
1. Navigate to `synthetix-api/`
2. Create a `.env` file from the provided example.
3. Add your `NAVIGATE_API_KEY` and `SUPABASE_URL`/`SUPABASE_KEY`.

### 3. Start the Next.js Frontend
Open a **new** terminal in the root directory:

```bash
cd synthetix-web

# Install dependencies
npm install

# Start the Development Server
npm run dev
```
*The Synthetix Dashboard will run on **http://localhost:3000**.*

---

## Usage 💡
1. Open `http://localhost:3000` in your browser.
2. Upload a PDF or enter notes in the **Input Nexus**.
3. Customize your synthesis using the **Module Toggles**.
4. Click **Ignite Synthesis** to generate your study materials!

