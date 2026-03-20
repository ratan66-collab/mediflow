from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Medical Component Handler API")

# Configure CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import reports, physio

app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(physio.router, prefix="/api/physio", tags=["Physio"])

@app.get("/")
def read_root():
    return {"message": "Medical API is running"}
