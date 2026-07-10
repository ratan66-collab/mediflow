# Mediflow

**Mediflow** is a comprehensive medical data analysis and component handler platform designed to manage medical reports, visualize diagnostic data, and assist with physiotherapy planning. It leverages advanced AI to extract structured data from medical documents and provides specialized interactive visualizations for both patients and medical professionals.

## 🌟 Key Features

- **Intelligent Report Analysis**: Integrates Google Gemini 2.0 Flash to process PDFs and images, extracting structured data (patient data, test types, specific metrics) and generating actionable medical insights.
- **Advanced Visualizations**: Features interactive React components such as `BodyMap` to highlight affected organs, `RangeBar` to visualize metric ranges, and trend graphs for monitoring patient progress.
- **AI Call Assistant**: Includes a dedicated module for automated appointment scheduling via a voice/call interface.
- **Physiotherapy Management**: Helps in planning and tracking physiotherapy sessions based on the medical reports.

## 🏗️ Project Architecture

The repository is structured into the following main components:

### 1. Frontend (`/client`)
A responsive, modern web application built for medical professionals and patients.
- **Framework**: React 19 with Vite 5
- **Styling**: Tailwind CSS 3
- **Key Libraries**: 
  - `recharts` for data visualization and trend graphs.
  - `@supabase/supabase-js` for database and authentication.
  - `lucide-react` for UI iconography.
  - `@mediapipe/tasks-vision` for advanced image processing capabilities.
- **Highlights**: Features custom components like `BodyMap.jsx` (dynamically highlighting affected organs based on AI analysis) and `InsightCard` (displaying detailed medical insights).

### 2. Backend (`/server`)
A robust RESTful API handling data processing, AI interactions, and business logic.
- **Framework**: FastAPI
- **Database**: SQLAlchemy with Psycopg2 connecting to PostgreSQL.
- **AI Integration**: Implements Google's `gemini-2.0-flash` for automated medical document analysis, status classification (Normal, High, Critical), and extraction of relevant metrics to specific organs.
- **Key API Routes**: 
  - `/api/reports` - Handling report uploads and analysis.
  - `/api/physio` - Managing physiotherapy data.

### 3. AI Call Assistant (`/call_assistant`)
An independent module designed to handle automated patient appointment bookings.
- **Features**: Pydantic data contracts for appointments, local SQLite database (`call_assistant.db`), and FastAPI endpoints for managing appointment requests.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm (for the frontend)
- Python 3.10+ (for the backend and AI components)
- PostgreSQL (or an active Supabase project)

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Set up a Python virtual environment and activate it:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file with necessary API keys (e.g., `GEMINI_API_KEY`) and database URIs.
5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install the necessary NPM packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible by default at `http://localhost:5173`.

### Call Assistant Setup
1. Navigate to the call assistant directory:
   ```bash
   cd call_assistant
   ```
2. Install dependencies (can use `uv` or `pip` based on `pyproject.toml`).
3. Start the assistant backend:
   ```bash
   uvicorn backend:app --reload
   ```

## 🧠 AI Integration Highlights
- **Prompt Engineering**: Uses sophisticated prompting to ensure strictly valid JSON outputs from Gemini 2.0 Flash, complete with confidence scores, recommended actions, dietary suggestions, and overall summaries.
- **Error Handling**: Automatically cleans model outputs and strips markdown to guarantee robust JSON parsing.

## 📄 License
This project is created for hackathon and developmental purposes.
