import requests

HF_TOKEN = ""

def caption_image(image_bytes):
    api_url = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    files = {"file": ("image.jpg", image_bytes)}

    response = requests.post(api_url, headers=headers, files=files)

    if response.status_code != 200:
        print("Caption API error:", response.status_code, response.text)
        return ""

    try:
        result = response.json()
        if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
            return result[0]["generated_text"]
    except Exception as e:
        print("Caption JSON decode error:", e)

    return ""

def ask_llm(prompt):
    api_url = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 100}
    }
    response = requests.post(api_url, headers=headers, json=payload)

    if response.status_code != 200:
        print("LLM API error:", response.status_code, response.text)
        return "Lỗi khi tạo phản hồi từ chatbot."

    try:
        result = response.json()
        return result[0]["generated_text"]
    except Exception as e:
        print("LLM JSON decode error:", e)
        return "Lỗi khi tạo phản hồi từ chatbot."
