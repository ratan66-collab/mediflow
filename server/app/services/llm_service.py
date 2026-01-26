import google.generativeai as genai
import os
import json
from typing import List

def configure_genai():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment")
        return None
    genai.configure(api_key=api_key)
    return True

def analyze_medical_report(file_bytes: bytes, mime_type: str):
    if not configure_genai():
        return {"error": "Server configuration error: Missing API Key"}

    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt = """
    You are an expert medical AI assistant. Your task is to extract structured data from this medical report.
    
    Please output a strictly valid JSON object with the following schema:
    {
      "patient_name": "string or null",
      "report_date": "YYYY-MM-DD or null",
      "test_type": "string (e.g. Blood Test, MRI, X-Ray)",
      "metrics": [
        {
          "name": "string (e.g. Hemoglobin)",
          "value": number or string,
          "unit": "string",
          "reference_range": "string",
          "status": "Normal" | "High" | "Low" | "Critical",
          "confidence_score": number (0-1),
          "insights": {
              "possible_causes": ["string", "string"],
              "recommended_actions": ["string", "string"],
              "dietary_suggestions": ["string", "string"],
              "affected_organs": ["string"] (e.g. ["Liver"], ["Heart"], ["Kidneys"])
          }
        }
      ],
      "overall_summary": "string (2-3 sentences explaining the health status)",
      "critical_findings": ["string", "string"]
    }
    
    IMPORTANT: 
    - For every "High", "Low", or "Critical" result, you MUST fill the "insights" object with specific medical knowledge.
    - If status is "Normal", insights can be minimal or null.
    - "affected_organs" should map the metric to the relevant body part (e.g. Creatinine -> Kidneys, AST/ALT -> Liver, Troponin -> Heart).
    """

    try:
        if mime_type == "application/pdf":
            # flexible handling if needed, but Gemini handles parts
            content = [{"mime_type": mime_type, "data": file_bytes}, prompt]
        else:
            # Assume image
            content = [{"mime_type": mime_type, "data": file_bytes}, prompt]

        response = model.generate_content(content)
        
        # Clean response text to ensure JSON
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
             text = text.split("```")[1].split("```")[0]
             
        return json.loads(text.strip())
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        return {"error": f"Failed to analyze report: {str(e)}"}
