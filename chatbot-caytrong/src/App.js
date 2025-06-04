import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // ✅ THÊM: Trạng thái mic
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() && !image) return;

    if (image && image.size > 5 * 1024 * 1024) {
      alert("Vui lòng chọn ảnh nhỏ hơn 5MB.");
      return;
    }

    const formData = new FormData();
    if (inputText.trim()) formData.append("message", inputText.trim());
    if (image) formData.append("image", image);

    const newMessage = {
      id: Date.now(),
      type: "user",
      text: inputText.trim(),
      image: image ? URL.createObjectURL(image) : null,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    setImage(null);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/chat", formData);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: res.data.answer,
          image: res.data.image || null,
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 2, type: "bot", text: "Lỗi server, vui lòng thử lại." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ THÊM: Hàm nhận giọng nói
  const handleMicClick = () => {
    if (!recognition) {
      alert("Trình duyệt không hỗ trợ nhận giọng nói");
      return;
    }

    if (!isListening) {
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? prev + " " : "") + transcript);
      };

      recognition.start();
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/Logo_DAI_NAM.png" alt="Logo Trường" className="logo" />
        <div className="header-title"> CHATBOT CÂY TRỒNG</div>
      </header>

      <main className="chat-window">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`chat-message ${msg.type === "user" ? "user-msg" : "bot-msg"}`}
          >
            {msg.image && (
              <img
                src={msg.image}
                alt="uploaded"
                className="chat-image"
                onLoad={e => URL.revokeObjectURL(e.target.src)}
              />
            )}
            {msg.text && <div className="chat-text">{msg.text}</div>}
          </div>
        ))}

        {loading && (
          <div className="chat-message bot-msg">
            <div className="chat-text typing">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="input-area">
        <textarea
          ref={inputRef}
          rows={1}
          className="chat-input"
          placeholder="Nhập câu hỏi..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="file"
          accept="image/*"
          id="upload-image"
          style={{ display: "none" }}
          onChange={e => setImage(e.target.files[0])}
        />
        <label htmlFor="upload-image" className="upload-btn" title="Tải ảnh lên">
          📷
        </label>

        {/* ✅ Nút MIC */}
        <button
          className="mic-btn"
          onClick={handleMicClick}
          title="Nhấn để nói"
        >
          {isListening ? "🛑" : "🎤"}
        </button>

        <button className="send-btn" onClick={handleSend} disabled={loading}>
          Gửi
        </button>
      </footer>
    </div>
  );
}

export default App;
