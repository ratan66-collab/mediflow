import database as dt

from sqlalchemy import Boolean,Column,DateTime,Integer,String, create_engine
import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session,declarative_base, sessionmaker

DATABASE_URL  = "sqlite:///./call_assistant.db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String, index=True)
    reason = Column(String, nullable=True)
    start_time = Column(DateTime, index=True)
    canceled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db() -> None:
    Base.metadata.create_all(bind=engine)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#init_db()