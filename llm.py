import requests

HF_TOKEN = ""  # Thay bằng token của bạn

def ask_llm(prompt):
    url = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": prompt}

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        print("LLM error:", response.text)
        return "Không thể tạo phản hồi từ LLM."

    try:
        return response.json()[0]["generated_text"]
    except:
        return "LLM không hiểu phản hồi."
