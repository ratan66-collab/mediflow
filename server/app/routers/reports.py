from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.llm_service import analyze_medical_report

router = APIRouter()

@router.post("/analyze")
def analyze_report(file: UploadFile = File(...)):
    # Basic validation
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        # Fallback check extension
        if not file.filename.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png', '.webp')):
             raise HTTPException(status_code=400, detail="Invalid file type. Allowed: PDF, JPEG, PNG, WEBP")
    
    # Read synchronously to allow FastAPI to push to background worker threadpool
    contents = file.file.read()
    
    # Analyze
    result = analyze_medical_report(contents, file.content_type)
    
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
        
    return result
