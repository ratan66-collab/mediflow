# MediFlow: Top 20 Hackathon Viva Questions & Answers

Use this sheet to prepare for technical questions judges might ask you during your project demonstration.

### Section 1: System Architecture & Overall Design

**Q1: What is the high-level architecture of MediFlow?**
**A:** MediFlow uses a modern decoupled architecture. The frontend is built with React and Vite. We have two distinct FastAPI backend microservices: one for handling heavy AI analysis (Port 8000) and a lightweight instance for real-time voice automation (Port 4444). We use Supabase for persistent cloud data and local SQLite for fast appointment caching.

**Q2: Why did you choose FastAPI for your backend instead of Node.js or Django?**
**A:** We chose FastAPI because it provides asynchronous, lightning-fast execution and native Python support. Since our project heavily relies on Python-based AI libraries, PyMuPDF for OCR, and SQLAlchemy, FastAPI was the most efficient and natural choice.

**Q3: How do you handle different AI models in the same application?**
**A:** We use a task-routing approach. For extremely fast, structured data extraction from medical PDFs, we route the request to Llama 3.1 (8B). When we need deep, complex medical reasoning (like generating a 7-day physiology plan based on symptoms), we route the request to the much larger Llama 3.3 (70B) model.

**Q4: Can you explain the role of Ngrok in your project?**
**A:** Because Vapi (our Voice Assistant) is a cloud service, it cannot directly reach the SQLite database on our local machine. Ngrok creates a secure tunnel that exposes our local internal port (4444) to the internet, allowing Vapi's webhook packets to successfully trigger our local Python functions.

### Section 2: Data Extraction & LLM Integration

**Q5: How do you extract medical data from uploaded PDFs?**
**A:** We use the `PyMuPDF` (fitz) library. It parses the binary PDF file and extracts raw, unstructured text from the document pages, which is then passed to our LLM service.

**Q6: LLMs usually return paragraphs of text. How do you force the AI to return data that you can display on a dashboard?**
**A:** We use strict prompt engineering and "JSON mode" constraints. We instruct the LLM acting as our AI handler to output its findings strictly matching a defined JSON schema (e.g., {"metrics": [], "symptoms": []}). This ensures the React frontend receives parseable data.

**Q7: How did you solve the problem of the AI giving vague reasons for patient symptoms?**
**A:** We refined our system prompt to mandate a specific formatting rule. We forced the AI to explicitly use the phrase "due to" (e.g., "Anemia - due to Low Hemoglobin (10.2 g/dL)"). This small prompt engineering trick vastly improved the clarity of the reports.

**Q8: Why did you use Groq instead of standard OpenAI/ChatGPT for your AI processing?**
**A:** Groq relies on completely different hardware architecture (LPUs - Language Processing Units) compared to standard GPUs. This allows Groq to run open-source models like Llama at incredibly fast inference speeds, which is critical for making our user experience feel instantaneous.

### Section 3: The Voice Assistant (Vapi)

**Q9: How does the Vapi voice assistant know when to actually perform an action versus just chatting?**
**A:** We configured "Tools" inside the Vapi dashboard. The underlying conversational AI determines the user's intent. If it recognizes a desire to schedule/cancel, it halts the standard text generation and instead forces a "Tool Call", firing a JSON payload containing exactly what needs to be done.

**Q10: Explain the exact mechanism of a "Tool Call".**
**A:** Vapi sends an HTTP POST request to our Ngrok URL. The payload contains a JSON string under the key `"name"`, for example: `"cancel_appointment"`. Our backend intercepts this exact string and routes the execution to the corresponding Python function.

**Q11: What prevents the voice assistant from crashing the main dashboard if it receives high traffic?**
**A:** We implemented a microservice design. The Voice Assistant webhook operates on a completely separate FastAPI instance (Port 4444) from the main dashboard backend (Port 8000). This ensures heavy voice automation won't bottleneck report analysis processing.

**Q12: How are appointments dynamically scheduled and retrieved through voice?**
**A:** When our `schedule_appointment` Python function is triggered by Vapi, it utilizes SQLAlchemy to write a new row directly into our SQLite database. It then returns a "Success" message to Vapi, which dynamically reads that success message out loud using Text-to-Speech to the user.

### Section 4: Frontend Development (React)

**Q13: Why did you use Vite to build your React frontend?**
**A:** Vite uses native ES modules, meaning the server doesn't need to bundle the entire application before starting up. It allows for Hot Module Replacement (HMR), making the development cycle incredibly fast and responsive compared to older bundlers like Webpack.

**Q14: Where does the Dashboard retrieve its health metrics from upon a page refresh?**
**A:** To avoid unnecessary, expensive, and slow API calls to the LLM on every page refresh, the frontend caches the latest analyzed JSON output directly into the browser's `LocalStorage`. 

**Q15: How did you implement the "Digital Body Map"?**
**A:** We used conditional React rendering. The AI specifically formats its JSON to include flags for affected areas (like `head`, `heart`, `legs`). The React component reads this boolean JSON data and dynamically applies glowing CSS classes to corresponding SVG paths of the human body.

**Q16: Why did you decide to use `st.table` instead of `st.dataframe` in your Call Assistant developer UI?**
**A:** In locally hosted environments, `st.dataframe` attempts to download and mount a very heavy React-based interactive canvas. This caused massive rendering delays. We switched to `st.table()`, which renders native semantic HTML tables instantaneously, improving performance.

### Section 5: Security & Considerations

**Q17: Is user data secure on this platform?**
**A:** Yes. Our platform leverages Supabase for authentication, meaning passwords and user identities are encrypted and handled seamlessly by a dedicated Auth provider using modern JWT token standards.

**Q18: What is your approach to handling failures if the AI hallucinates bad data?**
**A:** We use Pydantic models on the Python backend. If the LLM hallucinates and sends data that doesn't match our strict expected types (for example, sending a string when we need an integer for hemoglobin levels), Pydantic catches the error immediately before it can crash the database or the frontend.

**Q19: If you had more time for this Hackathon, what would you improve?**
**A:** (Example Answer) I would migrate from SQLite to Postgres for the voice assistant database to allow better scaling, and implement background Celery workers so that large, 50-page PDFs can be processed asynchronously without blocking the user UI.

**Q20: What was the biggest technical challenge you faced building MediFlow?**
**A:** (Example Answer) The hardest part was orchestrating the transition between the cloud Vapi AI and the locally hosted tools. Debugging the exact JSON payloads the AI sent to our webhook, and ensuring the Ngrok tunneling correctly mapped to the FastAPI routing without timing out, was complex but highly rewarding to solve.   
