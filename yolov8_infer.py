from ultralytics import YOLO
import os

# Tải model YOLOv8 đã huấn luyện sẵn
model = YOLO("best.pt")  # Đảm bảo bạn có tệp này

def detect_disease(image_path):
    results = model(image_path)
    names = model.names

    detected = []
    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            label = names[cls_id]
            detected.append(label)

    if not detected:
        return "Không phát hiện bệnh."
    return ", ".join(set(detected))
