// ChatMessage.jsx
import { memo } from "react";
import iraLogo from "../assets/ira-logo.png";

const ChatMessage = memo(({ msg, onCopy, onActionClick }) => {
  return (
    <div className={`chat-message-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}>
      {msg.sender === "bot" && (
        <div className="bot-avatar">
          <img src={iraLogo} alt="IRA" />
        </div>
      )}

      <div className={`chat-message ${msg.sender}`}>
        <p>{msg.text}</p>
        <span className="message-time">{msg.time}</span>

        {/* Actions Buttons */}
        {msg.actions && msg.actions.length > 0 && (
          <div className="message-actions">
            {msg.actions.map((action, index) => (
              <button
                key={index}
                className="action-btn"
                onClick={() => onActionClick(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {msg.sender === "bot" && (
          <button
            className="copy-btn"
            onClick={() => onCopy(msg.text)}
            title="Copy message"
          >
            📋
          </button>
        )}
      </div>
    </div>
  );
});

export default ChatMessage;