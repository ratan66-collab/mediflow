import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class PhysioService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.groq.com/openai/v1"
        )
            
        self.system_instruction = """
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

    def get_consultation(self, user_input: str):
        if not self.client:
            return {"error": "Server configuration error: Missing API Key"}
        print("Generating Physio Plan with llama-3.3-70b (Groq)...")
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": self.system_instruction},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.2,
                max_tokens=1024,
                top_p=0.7,
                stream=False,
                response_format={ "type": "json_object" }
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"error": f"Failed to parse AI response: {str(e)}"}

physio_service = PhysioService()
