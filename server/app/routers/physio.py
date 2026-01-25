from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.physio_service import physio_service

router = APIRouter()

class PhysioRequest(BaseModel):
    message: str

@router.post("/consult")
async def consult_physio(request: PhysioRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    response = await physio_service.get_consultation(request.message)
    return response
