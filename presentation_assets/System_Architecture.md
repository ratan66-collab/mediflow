# MediFlow System Architecture

This project is built using a modern AI-stack designed for high-performance medical data extraction and real-time voice interaction.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide Icons.
- **Main Backend (Port 8000)**: FastAPI, Python, PyMuPDF (OCR).
- **Automation Backend (Port 4444)**: FastAPI, SQLite (Local Data).
- **AI Models**: Groq Cloud (Llama 3.3 70B & Llama 3.1 8B).
- **Voice Stack**: Vapi API + Ngrok Tunneling.

## 🗺 System Map
1. **Frontend (Dashboard)**: The user hub for viewing health metrics and triggering consultations.
2. **Physio-AI Engine**: A specialized AI agent that converts injury descriptions into 7-day recovery plans.
3. **Call Assistant**: A persistent microservice that handles tool calls (Booking/Canceling) using local SQL storage.
4. **The Bridge (Ngrok)**: Connects your local machine to the global Vapi Voice AI network.
