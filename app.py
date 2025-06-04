from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from ultralytics import YOLO
from PIL import Image

app = Flask(__name__)
CORS(app)

HF_TOKEN = ""  # vẫn dùng token này

yolo_model = YOLO("best.pt")

def describe_image(image):
    api_url = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    files = {"file": (image.filename, image, image.content_type)}
    try:
        response = requests.post(api_url, headers=headers, files=files, timeout=10)
        response.raise_for_status()
        return response.json()[0]["generated_text"]
    except Exception as e:
        print("Caption API Error:", e)
        return "Không thể mô tả ảnh."

def detect_disease(image):
    image.seek(0)
    img = Image.open(image)
    results = yolo_model(img)
    names = results[0].names
    boxes = results[0].boxes.cls.tolist()
    if not boxes:
        return "Không phát hiện bệnh."
    labels = [names[int(cls)] for cls in boxes]
    return ", ".join(set(labels))

def ask_llm(prompt):
    API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 1000,
            "return_full_text": False
        }
    }
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        return response.json()[0]["generated_text"]
    except Exception as e:
        print("LLM Error:", e)
        return "Chatbot không thể trả lời lúc này."


def detect_language(text: str) -> str:
    vietnamese_chars = "ắằẳẵặâầấậẫẩăằắặẽẻẹéèẻẹíìỉịóòỏọôốồổỗộơớờởợúùủụưứừửựýỳỷỵđ"
    for ch in text.lower():
        if ch in vietnamese_chars:
            return "vi"
    return "en"

@app.route("/chat", methods=["POST"])
def chat():
    message = request.form.get("message", "").strip()
    image = request.files.get("image", None)

    caption, disease = "", ""
    if image:
        caption = describe_image(image)
        image.seek(0)
        disease = detect_disease(image)

    lang = detect_language(message) if message else "vi"

    prompt_parts = []

    if lang == "vi":
        prompt_parts.append("Bạn là trợ lý chăm sóc cây trồng, trả lời bằng tiếng Việt, ngắn gọn và rõ ràng.")
    else:
        prompt_parts.append("You are a plant care assistant. Please respond in English, concise and clear.")

    if caption:
        prompt_parts.append(caption)
    if disease:
        prompt_parts.append(f"Detection: {disease}")
    if message:
        prompt_parts.append(message)

    if len(prompt_parts) == 1:
        return jsonify({"answer": "Vui lòng gửi câu hỏi hoặc ảnh." if lang == "vi" else "Please send a question or image."})

    prompt = "\n".join(prompt_parts)
    print("📤 Prompt gửi đi:", prompt)
    answer = ask_llm(prompt)
    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(debug=True)
