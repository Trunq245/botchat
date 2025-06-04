import React, { useState } from "react";
import { sendMessage } from "./api";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message && !imageFile) {
      alert("Vui lòng nhập tin nhắn hoặc chọn ảnh");
      return;
    }
    setLoading(true);
    try {
      const reply = await sendMessage(message, imageFile);
      setMessages([
        ...messages,
        {
          from: "user",
          text: message || "(Gửi ảnh)",
          img: imageFile ? URL.createObjectURL(imageFile) : null,
        },
        { from: "bot", text: reply },
      ]);
      setMessage("");
      setImageFile(null);
    } catch (error) {
      alert("Lỗi gửi tin nhắn: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <div
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 10,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.from === "user" ? "right" : "left",
              marginBottom: 10,
            }}
          >
            {m.img && (
              <img
                src={m.img}
                alt="user upload"
                style={{ maxWidth: 150, borderRadius: 8 }}
              />
            )}
            <p
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 20,
                backgroundColor: m.from === "user" ? "#007bff" : "#e5e5ea",
                color: m.from === "user" ? "white" : "black",
                maxWidth: "80%",
                wordWrap: "break-word",
                margin: 0,
              }}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Nhập câu hỏi..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
        style={{ width: "70%", padding: 10, fontSize: 16 }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        disabled={loading}
        style={{ width: "20%", marginLeft: 10 }}
      />
      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        {loading ? "Đang xử lý..." : "Gửi"}
      </button>
    </div>
  );
}

export default Chat;
