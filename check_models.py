import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv("server/.env")

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("No API Key found")
else:
    client = OpenAI(api_key=api_key)
    try:
        print("Listing available models...")
        models = client.models.list()
        for m in models:
            print(f"- {m.id}")
    except Exception as e:
        print(f"Error: {e}")
