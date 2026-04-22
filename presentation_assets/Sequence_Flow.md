# MediFlow Sequence Flow

This diagram illustrates the end-to-end interactions between the user, the platform, and the AI services.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as React Frontend
    participant API as Main Backend (8000)
    participant AI as Groq (Llama 3.3)
    participant Vapi as Vapi Voice AI
    participant CallAPI as Local Tool API (4444)

    Note over User, AI: Scenario 1: Report Analysis
    User->>Web: Upload PDF
    Web->>API: POST /analyze
    API->>API: Extract Text (OCR)
    API->>AI: Analyze Text
    AI-->>API: JSON Results
    API-->>Web: Metrics & Findings
    Web-->>User: Update UI/Body Map

    Note over User, AI: Scenario 2: Physio Recovery Plan
    User->>Web: Describe symptoms
    Web->>API: POST /physio/consult
    API->>AI: Generate 7-Day Plan
    AI-->>API: Weekly JSON Schedule
    API-->>Web: Structured Plan
    Web-->>User: Render Weekly Grid

    Note over User, CallAPI: Scenario 3: Voice Assistant Tool Calls
    User->>Vapi: "Schedule an appointment"
    Vapi->>CallAPI: POST /schedule_appointment (via Ngrok)
    CallAPI->>CallAPI: Update SQLite DB
    CallAPI-->>Vapi: Confirmation
    Vapi-->>User: "I've booked your session"
```

## Flow Details:
1. **Medical Report Flow:** Converts raw unstructured PDFs into actionable medical metrics using Llama 3.1.
2. **Physio Consultation Flow:** Uses Llama 3.3 70B on Groq for high-intelligence physiological planning.
3. **Voice Automation Flow:** Uses `ngrok` to bridge Vapi's cloud environment with your local `call_assistant` backend for real-time tool execution.
