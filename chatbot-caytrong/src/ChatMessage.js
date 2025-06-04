import React from 'react';

function ChatMessage({ message }) {
  return (
    <div className={message.sender === 'user' ? 'user-message' : 'bot-message'}>
      {message.image && (
        <img src={URL.createObjectURL(message.image)} alt="user upload" className="chat-image" />
      )}
      <p>{message.text}</p>
    </div>
  );
}

export default ChatMessage;
