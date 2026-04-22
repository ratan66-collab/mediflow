#step 1 Import Database objects
import datetime as dt
from database import init_db, Appointment, get_db

init_db()


#--------------------------------------------------------------------------------------------------
#step 3 Create data Contracts using pydantic models
from pydantic import BaseModel
from typing import Optional

class AppointmentRequest(BaseModel):
    patient_name: str
    reason: Optional[str] = None
    start_time: dt.datetime

class AppointmentResponse(BaseModel):
    id: int
    patient_name : str
    reason : Optional[str] = None
    start_time : dt.datetime
    canceled : bool
    created_at : dt.datetime

class CancelAppointmentRequest(BaseModel):
    patient_name: str
    date: dt.date

class CancelAppointmentResponse(BaseModel):
    canceled_count: int

class ListAppointmentRequest(BaseModel):
    date: dt.date
    patient_name: Optional[str] = None

#--------------------------------------------------------------------------------------------------
#step 2 Create Fastapi application and endpoints psuedo code
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
app = FastAPI()

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")

#schedule appt
@app.post("/schedule_appointments/")
@app.post("/schedule_appointment")
def schedule_appointment(request:AppointmentRequest, db: Session = Depends(get_db)):
    new_appointment = Appointment(
        patient_name = request.patient_name,
        reason = request.reason,
        start_time = request.start_time,
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    new_appointment_return_obj = AppointmentResponse(
        id=new_appointment.id,
        patient_name=new_appointment.patient_name,
        reason=new_appointment.reason,
        start_time=new_appointment.start_time,
        canceled=new_appointment.canceled,
        created_at=new_appointment.created_at
    )
    return new_appointment_return_obj

#cancel 
from sqlalchemy import select
@app.post("/cancel_appointments/")
@app.post("/cancel_appointment")
def cancel_appointment(request:CancelAppointmentRequest, db: Session = Depends(get_db)):
    start_dt = dt.datetime.combine(request.date, dt.time.min)
    end_dt = start_dt + dt.timedelta(days=1)
    
    result = db.execute(
        select(Appointment)
        .where(Appointment.patient_name == request.patient_name)
        .where(Appointment.start_time >= start_dt)
        .where(Appointment.start_time <= end_dt)
        .where(Appointment.canceled == False)
    )

    appointments = result.scalars().all()
    if not appointments:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    for appointment in appointments:
        appointment.canceled = True
    
    db.commit()
        
    return CancelAppointmentResponse(canceled_count=len(appointments))
    
#list appt
@app.post("/list_appointments/")
@app.post("/list_appointment")
@app.post("/check_appointment")
@app.post("/check_doctor_availability")
def list_appointment(request: ListAppointmentRequest, db: Session = Depends(get_db)):

    start_dt = dt.datetime.combine(request.date, dt.time.min)
    end_dt = start_dt + dt.timedelta(days=1)
    
    query = (
        select(Appointment)
        .where(Appointment.canceled == False)
        .where(Appointment.start_time >= start_dt)
        .where(Appointment.start_time <= end_dt)
    )
    if request.patient_name:
        query = query.where(Appointment.patient_name.ilike(f"%{request.patient_name}%"))
        
    query = query.order_by(Appointment.start_time.asc())
    result = db.execute(query)

    appointments = result.scalars().all()

    booked_appointments = []
    for appointment in appointments:
        appointment_obj = AppointmentResponse(
            id=appointment.id,
            patient_name=appointment.patient_name,
            reason=appointment.reason,
            start_time=appointment.start_time,
            canceled=appointment.canceled,
            created_at=appointment.created_at
        )
        booked_appointments.append(appointment_obj)

    return booked_appointments

#--------------------------------------------------------------------------------------------------

#step 4 wwrite actual code
from fastapi import Request
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/webhook")
@app.post("/api/webhook/{tool_name}")
@app.post("/{tool_name}")
async def ai_assistant_webhook(request: Request, tool_name: Optional[str] = None, db: Session = Depends(get_db)):
    """
    This endpoint acts as the Server URL for Vapi/AI Assistant tool calls.
    Configure your AI Assistant to send POST requests here.
    """
    try:
        data = await request.json()
        logger.info(f"Received webhook from AI: {json.dumps(data, indent=2)}")
        
        message = data.get("message", {})
        
        # If the user sets up apiRequest tools in Vapi, Vapi sends the raw arguments directly without the 'message' wrapper.
        if tool_name and "message" not in data:
            # Fake the standard structure so we can reuse the logic below
            message = {
                "type": "tool-calls",
                "toolWithToolCallList": [
                    {
                        "toolCall": {
                            "id": "direct_api_req",
                            "function": {
                                "name": tool_name,
                                "arguments": data
                            }
                        }
                    }
                ]
            }

        
        # Depending on the AI provider (like Vapi), the payload structure may vary slightly.
        # Handling the standard tool-calls event:
        if message.get("type") == "tool-calls":
            tool_calls = message.get("toolWithToolCallList", [])
            responses = []
            
            for item in tool_calls:
                tool_call = item.get("toolCall", {})
                function_call = tool_call.get("function", {})
                name = function_call.get("name")
                args = function_call.get("arguments", {})
                
                # If arguments is a string, parse it to a dictionary
                if isinstance(args, str):
                    args = json.loads(args)

                if name == "schedule_appointment":
                    # Extract fields that AI passed
                    patient_name = args.get("patient_name", "Unknown Patient")
                    reason = args.get("reason", "Booked via AI Assistant")
                    start_time_str = args.get("start_time")
                    
                    try:
                        # Attempt to parse date from string
                        if start_time_str:
                            # Replace Z with +00:00 for Python isoformat parsing
                            start_time_str = start_time_str.replace("Z", "+00:00")
                            start_dt = dt.datetime.fromisoformat(start_time_str)
                            # Strip timezone info so it fits SQLite datetime format if needed
                            start_dt = start_dt.replace(tzinfo=None)
                        else:
                            start_dt = dt.datetime.now() + dt.timedelta(days=1)
                    except ValueError:
                        start_dt = dt.datetime.now() + dt.timedelta(days=1)

                    # Save to database
                    new_appt = Appointment(
                        patient_name=patient_name,
                        reason=reason,
                        start_time=start_dt
                    )
                    db.add(new_appt)
                    db.commit()
                    db.refresh(new_appt)
                    
                    # Return success response back to AI
                    responses.append({
                        "toolCallId": tool_call.get("id"),
                        "result": f"Success! Appointment generated with ID {new_appt.id} on {start_dt.strftime('%Y-%m-%d %H:%M')}"
                    })
                
                elif name == "cancel_appointment":
                    patient_name = args.get("patient_name")
                    date_str = args.get("date")
                    try:
                        cancel_date = dt.date.fromisoformat(date_str) if date_str else dt.date.today()
                        start_dt = dt.datetime.combine(cancel_date, dt.time.min)
                        end_dt = start_dt + dt.timedelta(days=1)
                        
                        result = db.execute(
                            select(Appointment)
                            .where(Appointment.patient_name == patient_name)
                            .where(Appointment.start_time >= start_dt)
                            .where(Appointment.start_time <= end_dt)
                            .where(Appointment.canceled == False)
                        )
                        appointments = result.scalars().all()
                        
                        for appt in appointments:
                            appt.canceled = True
                        db.commit()
                        
                        if appointments:
                            responses.append({"toolCallId": tool_call.get("id"), "result": f"Successfully canceled {len(appointments)} appointment(s)."})
                        else:
                            responses.append({"toolCallId": tool_call.get("id"), "result": "No active appointments found for this patient to cancel."})
                    except Exception as e:
                        responses.append({"toolCallId": tool_call.get("id"), "error": f"Error canceling: {str(e)}"})

                elif name in ["check_appointment", "list_appointments", "check_doctor_availability"]:
                    date_str = args.get("date")
                    patient_name = args.get("patient_name")
                    try:
                        check_date = dt.date.fromisoformat(date_str) if date_str else dt.date.today()
                        start_dt = dt.datetime.combine(check_date, dt.time.min)
                        end_dt = start_dt + dt.timedelta(days=1)
                        
                        query = (
                            select(Appointment)
                            .where(Appointment.canceled == False)
                            .where(Appointment.start_time >= start_dt)
                            .where(Appointment.start_time <= end_dt)
                        )
                        if patient_name:
                            query = query.where(Appointment.patient_name.ilike(f"%{patient_name}%"))
                            
                        query = query.order_by(Appointment.start_time.asc())
                        result = db.execute(query)
                        appointments = result.scalars().all()
                        
                        if appointments:
                            appt_list = [f"{a.start_time.strftime('%H:%M')} for {a.patient_name}" for a in appointments]
                            responses.append({"toolCallId": tool_call.get("id"), "result": f"Appointments for {check_date}: " + "; ".join(appt_list)})
                        else:
                            responses.append({"toolCallId": tool_call.get("id"), "result": f"No appointments found for {check_date}."})
                    except Exception as e:
                        responses.append({"toolCallId": tool_call.get("id"), "error": f"Error listing: {str(e)}"})

                else:
                    responses.append({
                        "toolCallId": tool_call.get("id"),
                        "error": f"Tool '{name}' is not supported yet."
                    })

            return {"results": responses}
        
        return {"status": "success", "message": "Webhook received but no tool-call processed."}
        
    except Exception as e:
        logger.error(f"Error handling webhook: {e}")
        return {"status": "error", "message": str(e)}

#--------------------------------------------------------------------------------------------------

#step 5 dashboard and testing backend logic



#--------------------------------------------------------------------------------------------------

import uvicorn
if __name__ == "__main__":
    uvicorn.run("backend:app", host="127.0.0.1", port=4444, reload=True)
