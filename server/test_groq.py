import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)

prompt = """
{
  "patient_name": "string",
  "overall_summary": "string",
  "metrics": [
    {
      "name": "string",
      "status": "Normal" | "High" | "Low" | "Critical",
      "insights": {
          "possible_causes": ["string"]
      }
    }
  ]
}
"""

try:
    print("Sending Request...")
    llm_response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": "Extract data for Hemoglobin is 14 g/dl."}
        ],
        temperature=0.1,
        max_tokens=4000,
        response_format={ "type": "json_object" }
    )
    print("SUCCESS")
    print(llm_response.choices[0].message.content)
except Exception as e:
    print("FATAL ERROR:", str(e))
