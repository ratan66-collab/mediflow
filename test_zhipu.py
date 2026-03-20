import os
from openai import OpenAI

api_key = "3a0e74358ce7488cb57374609e5f3963.3i8pb5djHOkzl5h1xpIDyBHK"
client = OpenAI(
    api_key=api_key,
    base_url="https://open.bigmodel.cn/api/paas/v4/"
)

try:
    response = client.chat.completions.create(
        model="glm-4",
        messages=[{"role": "user", "content": "Hello"}],
    )
    print("SUCCESS:", response.choices[0].message.content)
except Exception as e:
    print("ERROR:", e)
