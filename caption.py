import requests

HF_TOKEN = ""  # Thay bằng token của bạn

def describe_image(image_path):
    url = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    with open(image_path, "rb") as f:
        files = {"file": f}
        response = requests.post(url, headers=headers, files=files)

    if response.status_code != 200:
        print("BLIP API Error:", response.text)
        return "Không thể mô tả ảnh."

    try:
        result = response.json()
        return result[0]["generated_text"]
    except:
        return "Không thể phân tích ảnh."
def detect_plant_issue(image):
    # Caption bằng BLIP
    api_url = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    image.seek(0)
    files = {"file": (image.filename, image, image.content_type)}

    try:
        response = requests.post(api_url, headers=headers, files=files)
        result = response.json()
        if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
            return result[0]["generated_text"]
        return "Không thể mô tả ảnh."
    except Exception as e:
        print("Caption error:", e)
        return "Không thể mô tả ảnh."
