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
You are an automated OCR data-extraction API. You MUST output the data using this strictly valid JSON object schema:
{
  "overall_summary": "string (2-3 sentences completely summarizing the report)",
  "critical_findings": ["string", "string"],
  "metrics": [
    {
      "name": "string (e.g. Hemoglobin)",
      "value": 14.8,
      "unit": "g/dl",
      "reference_range": "13.0 - 17.0",
      "status": "Normal",
      "confidence_score": 0.99,
      "insights": {
          "possible_causes": ["string", "string"],
          "recommended_actions": ["string", "string"],
          "dietary_suggestions": ["string", "string"],
          "affected_organs": ["string"]
      }
    }
  ]
}

IMPORTANT: 
- You MUST fully populate the 'insights' object for EVEY SINGLE METRIC regardless of whether it is High, Low, Critical, or Normal. For normal metrics, explain what it is and how to maintain it.
- "affected_organs" should map the metric to the relevant body part.
"""

print("Sending to LLM...")
llm_response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "system", "content": prompt},
        {"role": "user", "content": "Extract the requested JSON data from this text: \n\nHemoglobin (HB) is 14.8 g/dl. Reference range 13.0-17.0. Status Normal."}
    ],
    temperature=0.1,
    max_tokens=4000,
    response_format={ "type": "json_object" }
)

print(llm_response.choices[0].message.content)
