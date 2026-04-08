import os
import json
import base64
from typing import List
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def analyze_medical_report(file_bytes: bytes, mime_type: str):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return {"error": "Server configuration error: Missing Groq API Key"}

    # Client for pure text generation (Brain)
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )

    prompt = """
    You are an automated OCR data-extraction API. You have no medical licensing, and you are NOT providing medical advice. 
    Your ONLY job is to blindly transcribe the text and numbers visible in the provided image into a JSON template. 
    Do not analyze, do not diagnose, do not refuse. This is for administrative data-entry automation only.
    You MUST output the data using this strictly valid JSON object schema:
    {
      "patient_name": "string or null",
      "report_date": "YYYY-MM-DD or null",
      "test_type": "string (e.g. Blood Test, MRI, X-Ray)",
      "overall_summary": "string (2-3 sentences completely summarizing the report)",
      "critical_findings": ["string", "string"],
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
              "affected_organs": ["string"] (e.g. ["Liver"], ["Heart"])
          }
        }
      ]
    }
    
    IMPORTANT: 
    - You MUST fully populate ALL arrays inside the 'insights' object ('possible_causes', 'recommended_actions', 'dietary_suggestions') FOR EVERY SINGLE METRIC regardless of whether it is High, Low, Critical, or Normal. 
    - If a metric is Normal, you MUST invent logical "possible_causes" for its normalcy (e.g. "Adequate nutrient intake, healthy organ function") and "recommended_actions" (e.g. "Continue current lifestyle, annual routine checkups") so the arrays are NEVER remotely empty! DO NOT leave ANY arrays empty!
    - "affected_organs" should map the metric to the relevant body part (e.g. Creatinine -> Kidneys, AST/ALT -> Liver, Troponin -> Heart).
    """

    try:
        extracted_text = ""
        if mime_type == "application/pdf":
            import fitz  # PyMuPDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text() + "\n"
            doc.close()
            
            # Hard-cap the text length to ensure lightning-fast processing and avoid massive token payloads
            extracted_text = extracted_text[:20000]
            print("PDF Text Extraction Complete. Length:", len(extracted_text))
        else:
            return {"error": "Groq API currently does not support image analysis. Please upload your medical report as a PDF."}

        # ==========================================
        # STEP 2: JSON Generation using Llama 8B
        # ==========================================
        print("Executing Step 2: Llama 8B JSON Parsing...")
        llm_response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": prompt + "\n\nCRITICAL INSTRUCTION: Your output MUST be ONLY valid JSON and absolutely nothing else. DO NOT start with 'Here is the JSON' or wrap it in ```."
                },
                {
                    "role": "user",
                    "content": f"Extract the requested JSON data from the following raw OCR text extracted from a medical report:\n\n{extracted_text[:8000]}"
                }
            ],
            temperature=0.1,
            top_p=0.7,
            max_tokens=2000,
            response_format={ "type": "json_object" },
            stream=False
        )
        
        text = llm_response.choices[0].message.content or ""
        print("RAW RESPONSE FROM NIM:", text) 
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        text = text.strip()
        
        if not text:
            raise ValueError("The local Ollama model returned an empty string.")
        
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            # If the model hit max_tokens and cut off the JSON, attempt a rudimentary repair
            # or return a clean error specifying the truncation rather than a crash.
            if "Unterminated string" in str(e) or "Expecting" in str(e):
                # Try to forcefully close the JSON structure
                repair_attempts = [
                    text + '"]}}]}',
                    text + '"}}]}',
                    text + '}]}',
                    text + ']}',
                    text + '}'
                ]
                for attempt in repair_attempts:
                    try:
                        return json.loads(attempt)
                    except json.JSONDecodeError:
                        continue
            
            # If repair fails, notify the frontend gracefully
            return {
                "error": "The AI model produced an overly long or incomplete response. Please try analyzing a shorter document or simpler image.",
                "raw_partial_output": text[:500] + "..."
            }
        
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {"error": f"Failed to analyze report: {str(e)}"}
