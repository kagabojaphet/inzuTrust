import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "./AiChatbox.css";
import iraLogo from "../assets/ira-logo.png";
import ChatMessage from "./ChatMessage";

const knowledgeBase = [ /* ... keep your existing knowledgeBase ... */ ];

const quickSuggestions = [
  "How do I search for properties?",
  "How do I request a viewing?",
  "How do favorites work?",
  "How can landlords post a property?",
];

const initialMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Hi 👋 I'm IRA, your smart rental assistant. Ask me anything about properties, viewings, or using InzuTrust!",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const getBotResponse = (message) => {
  const clean = message
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove symbols/emojis
    .trim();

  // 👋 greetings
  if (["hi", "hello", "hey"].some(g => clean.includes(g))) {
    return {
      text: "Hey 👋 What would you like to do?",
      actions: [
        { label: "Find a house 🏠", value: "find_house" },
        { label: "Request a viewing 📅", value: "request_viewing" },
        { label: "Post a property 📤", value: "post_property" },
      ],
    };
  }

  // 🎯 DIRECT INTENT MATCHING (IMPORTANT FIX)
  if (clean.includes("search") || clean.includes("find")) {
    return "🔍 To search for properties:\nGo to the Properties page and use filters like location, price, and type.";
  }

  if (clean.includes("viewing") || clean.includes("visit")) {
    return "📅 To request a viewing:\nOpen a property → Click 'Request Viewing' → Select date & time.";
  }

  if (clean.includes("favorite")) {
    return "⭐ You can save properties by clicking the 'Favorite' button and view them later in your dashboard.";
  }

  if (clean.includes("post") || clean.includes("upload")) {
    return "📤 To post a property:\nGo to your dashboard → Add Property → Fill details → Upload images.";
  }

  // 🧠 fallback
  return "Hmm 🤔 I didn’t get that.\nTry:\n• Find a house\n• Request a viewing\n• Post a property";
};
export default function AiChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("inzutrust_chat_history");
    return saved ? JSON.parse(saved) : initialMessages;
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced localStorage
  useEffect(() => {
    const id = setTimeout(() => {
      const limited = messages.slice(-50);
      localStorage.setItem("inzutrust_chat_history", JSON.stringify(limited));
    }, 300);
    return () => clearTimeout(id);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && isOpen && setIsOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const sendMessage = useCallback((text) => {
    if (!text?.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const id = setTimeout(() => {
      const response = getBotResponse(text);
      
      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        text: typeof response === "string" ? response : response.text,
        actions: response.actions || [],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 650);

    setTimeoutId(id);
  }, [isTyping]);

  const stopTyping = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsTyping(false);
  }, [timeoutId]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  }, [input, sendMessage]);

  const clearChat = useCallback(() => {
    setMessages(initialMessages);
    localStorage.removeItem("inzutrust_chat_history");
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    // Optional: You can add a toast notification here later
  }, []);

  const suggestions = useMemo(() => quickSuggestions, []);

  return (
    <>
      <button
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open IRA assistant"}
      >
        {isOpen ? "✕" : <img src={iraLogo} alt="IRA" className="chat-logo" />}
      </button>

      {isOpen && (
        <div className="chatbox-wrapper" role="dialog" aria-labelledby="chat-title">
          <div className="chatbox-header">
            <div className="chat-header-info">
              <img src={iraLogo} alt="IRA" className="header-logo" />
              <div>
                <h3 id="chat-title">IRA</h3>
                <p>Your Inzu Rental Assistant • Online</p>
              </div>
            </div>
            <button className="clear-btn" onClick={clearChat}>
              Clear
            </button>
          </div>

          <div className="chatbox-body">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                msg={msg} 
                onCopy={copyToClipboard}
                onActionClick={sendMessage}
              />
            ))}

            {isTyping && (
              <div className="chat-message-row bot-row">
                <div className="bot-avatar">
                  <img src={iraLogo} alt="IRA" />
                </div>
                <div className="typing-wrapper">
                  <div className="chat-message bot typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <button onClick={stopTyping} className="stop-btn">
                    Stop
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-btn"
                onClick={() => sendMessage(suggestion)}
                disabled={isTyping}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form className="chatbox-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                  setInput("");
                }
              }}
              placeholder="Ask IRA anything about renting..."
              disabled={isTyping}
            />
            <button type="submit" disabled={!input.trim() || isTyping}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}