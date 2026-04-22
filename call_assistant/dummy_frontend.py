import streamlit as st
import datetime as dt 
import requests

st.title("Dubai Hospital Appointment Booking Portal")

base_url = st.text_input("Backend URL", "http://127.0.0.1:4444", help="Replace this with your Ngrok forwarding URL (e.g. https://xxx.ngrok.app) if you are testing externally!").rstrip("/")

patient_name = st.text_input("Patient name")
reason = st.text_input("Reason")

# Default date to tomorrow
start_date = st.date_input("Date", value=dt.date.today() + dt.timedelta(days=1))

# Time dropdown options (every 30 mins)
time_options = [f"{h:02d}:{m:02d}" for h in range(0, 24) for m in (0, 30)]
# The screenshot shows 09:00 as the default
start_time_str = st.selectbox("Time", options=time_options, index=time_options.index("09:00"))

if st.button("Schedule"):
    if not patient_name:
        st.warning("Please enter a patient name.")
    else:
        # Combine date and time
        hour, minute = map(int, start_time_str.split(":"))
        start_time = dt.time(hour, minute)
        appointment_dt = dt.datetime.combine(start_date, start_time)
        
        # Prepare the payload for the backend
        payload = {
            "patient_name": patient_name,
            "reason": reason,
            "start_time": appointment_dt.isoformat()
        }
        
        with st.spinner("Booking appointment..."):
            try:
                response = requests.post(f"{base_url}/schedule_appointments/", json=payload)
                if response.status_code == 200:
                    st.success("Appointment scheduled successfully!")
                    st.json(response.json())
                else:
                    st.error(f"Failed to schedule. Backend returned status code: {response.status_code}")
                    st.text(response.text)
            except requests.exceptions.RequestException as e:
                st.error(f"Error connecting to the backend at {base_url}. Please ensure the backend server is running.")
                st.exception(e)

st.divider()
st.subheader("Cancel")

cancel_name = st.text_input("Patient name to cancel", key="cancel_name")
cancel_date = st.date_input("Date to cancel", key="cancel_date", value=dt.date.today())

if st.button("Cancel appointments"):
    payload = {"patient_name": cancel_name.strip(), "date": cancel_date.isoformat()}
    try:
        resp = requests.post(f"{base_url}/cancel_appointments/", json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json() if resp.content else {}
        st.success(f"Successfully Canceled {data.get('canceled_count', 0)} appointment(s)!")
        # We removed st.rerun() so the green success banner stays on your screen!
    except requests.exceptions.RequestException as exc:
        if exc.response is not None and exc.response.status_code == 404:
            st.warning("No active appointments found to cancel. They might already be canceled!")
        else:
            st.error(f"Cancel failed: {exc}")

st.divider()
st.subheader("Check Appointments")

appointments_date = st.date_input("Date to check appointments", key="check_appointment_date", value=dt.date.today())
check_patient_name = st.text_input("Patient name to check (optional)", key="check_patient_name")

if st.button("Check appointments"):
    try:
        payload = {"date": appointments_date.isoformat()}
        if check_patient_name.strip():
            payload["patient_name"] = check_patient_name.strip()
            
        resp = requests.post(f"{base_url}/list_appointments/", json=payload, timeout=10)
        data = resp.json()
        if not data:
            st.info("No active appointments found for this date.")
        else:
            st.dataframe(data, width='stretch', hide_index=True)
    except requests.exceptions.RequestException as exc:
        st.warning(f"Could not load appointments: {exc}")
