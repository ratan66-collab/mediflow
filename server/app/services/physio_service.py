import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

class PhysioService:
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            generation_config=generation_config,
            system_instruction="""
            You are an expert Physiotherapist. Create a structured WEEKLY recovery plan (Day 1 to Day 7).
            
            When a user describes pain/injury:
            1. Analyze it.
            2. Create a 7-Day Plan (gradual progression).
            3. Each day should have specific exercises.

            RETURN JSON ONLY:
            {
                "diagnosis_note": "Based on your description...",
                "weekly_plan": [
                    {
                        "day": "Day 1",
                        "focus": "Gentle Mobility",
                        "exercises": [
                            { "name": "Exercise A", "reps": "10", "sets": 2, "duration_minutes": 5 }
                        ]
                    },
                     {
                        "day": "Day 2",
                        "focus": "Stability",
                        "exercises": []
                    }
                    // ... up to Day 7
                ],
                "recovery_tips": ["Tip 1"]
            }
            """
        )

    async def get_consultation(self, user_input: str):
        chat_session = self.model.start_chat(history=[])
        response = chat_session.send_message(user_input)
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            return {"error": "Failed to parse AI response", "raw": response.text}

physio_service = PhysioService()
