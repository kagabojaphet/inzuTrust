import { useEffect, useRef, useState } from "react";
import "./AiChatbox.css";
import iraLogo from "../assets/ira-logo.png";

const knowledgeBase = [
  {
    keywords: ["hello", "hi", "hey"],
    response:
      "Hello! I'm IRA, your Inzu Rental Assistant. I can help you understand the platform, find properties, save favorites, request viewings, and more.",
  },
  {
    keywords: ["mission", "purpose"],
    response:
      "InzuTrust's mission is to simplify the rental experience by connecting tenants and landlords in a secure and reliable digital platform.",
  },
  {
    keywords: ["vision", "future"],
    response:
      "InzuTrust aims to become the most trusted rental platform in Rwanda, helping people find homes faster and more securely.",
  },
  {
    keywords: ["service", "services", "offer", "offers"],
    response:
      "InzuTrust offers property listings, property search, landlord property management, favorites, viewing requests, news updates, and contact support.",
  },
  {
    keywords: ["what is inzutrust", "about inzutrust", "inzutrust"],
    response:
      "InzuTrust is a rental platform that connects tenants and landlords. It helps users search for homes, save favorites, request viewings, manage listings, and stay updated through news and support features.",
  },
  {
    keywords: ["tenant", "renter"],
    response:
      "A tenant can browse properties, search with filters, save favorites, request viewings, read news updates, and contact support.",
  },
  {
    keywords: ["landlord", "owner"],
    response:
      "A landlord can create property listings, upload images, manage listings, and respond to viewing requests from tenants.",
  },
  {
    keywords: ["admin", "administrator"],
    response:
      "An admin manages special platform features such as publishing news updates and controlling administrative parts of the system.",
  },
  {
    keywords: ["property", "properties", "house", "apartment", "room", "rent", "rental"],
    response:
      "You can browse rental properties such as houses, apartments, rooms, land, and commercial spaces. Each listing includes location, rent amount, property details, and images.",
  },
  {
    keywords: ["property type", "types of properties", "types"],
    response:
      "InzuTrust supports different property types such as houses, apartments, rooms, land, and commercial spaces.",
  },
  {
    keywords: ["district", "sector", "address", "location"],
    response:
      "Each property includes location details such as district, sector, and address to help users know where it is located.",
  },
  {
    keywords: ["price", "rent amount", "cost", "budget"],
    response:
      "Each property includes its rent amount so tenants can compare options and choose a property that fits their budget.",
  },
  {
    keywords: ["bedroom", "bedrooms", "bathroom", "bathrooms"],
    response:
      "Property listings include bedroom and bathroom information to help tenants choose what best matches their needs.",
  },
  {
    keywords: ["image", "images", "photo", "photos", "upload"],
    response:
      "Landlords can upload property images to make listings more attractive and help tenants understand the property before visiting it.",
  },
  {
    keywords: ["search", "find", "filter", "filters"],
    response:
      "You can search for properties using filters like district, property type, price range, bedrooms, bathrooms, and availability status.",
  },
  {
    keywords: ["sort", "sorting"],
    response:
      "Properties can be sorted using fields like rent amount or newest listings to help users find the most relevant options faster.",
  },
  {
    keywords: ["favorite", "favorites", "save property", "saved properties", "save"],
    response:
      "You can save properties as favorites so you can easily return to them later. You can also remove a property from favorites when you no longer need it.",
  },
  {
    keywords: ["view favorites", "my favorites"],
    response:
      "The favorites feature allows users to see a list of saved properties in one place, making it easier to compare and revisit them.",
  },
  {
    keywords: ["viewing", "viewing request", "visit", "appointment", "schedule", "request viewing"],
    response:
      "Tenants can request a property viewing by selecting a preferred date and time. The landlord can then accept or reject the request.",
  },
  {
    keywords: ["accept viewing", "reject viewing", "landlord response"],
    response:
      "Landlords can review viewing requests for their properties and respond by accepting or rejecting them.",
  },
  {
    keywords: ["preferred date", "preferred time", "date and time"],
    response:
      "When requesting a viewing, tenants can choose a preferred date and time so the landlord can respond based on availability.",
  },
  {
    keywords: ["cancel viewing", "cancel appointment", "cancel request"],
    response:
      "If you need to cancel a viewing request, you can do so through your dashboard before the landlord has responded, or by contacting the InzuTrust support team.",
  },
  {
    keywords: ["news", "updates", "announcement", "announcements"],
    response:
      "The news section allows administrators to publish platform updates and announcements. Users can read, like, dislike, comment on, and share news posts.",
  },
  {
    keywords: ["like", "dislike", "comment", "share"],
    response:
      "Users can interact with news posts by liking, disliking, commenting, and sharing them.",
  },
  {
    keywords: ["contact", "contact us", "support", "help", "message"],
    response:
      "If you need help, you can use the Contact Us section to send a message to the InzuTrust team. The system can also send an automatic reply to confirm your message was received.",
  },
  {
    keywords: ["register", "sign up", "signup", "create account"],
    response:
      "You can register an account as a tenant or landlord. After registering, you may need to verify your email before logging in.",
  },
  {
    keywords: ["login", "log in", "sign in"],
    response:
      "If you already have an account, use the login page to sign in with your email and password so you can access your dashboard and protected features.",
  },
  {
    keywords: ["otp", "verification", "verify email", "email verification"],
    response:
      "After registration, the platform may send an OTP to your email so you can verify your account before logging in.",
  },
  {
    keywords: ["forgot password", "reset password", "password reset", "lost password"],
    response:
      "If you forgot your password, use the Forgot Password option on the login page. You will receive an email with instructions to reset your password securely.",
  },
  {
    keywords: ["change password", "update password"],
    response:
      "You can update your password through your account settings once you are logged in. Make sure to choose a strong and secure password.",
  },
  {
    keywords: ["dashboard", "profile", "account"],
    response:
      "The dashboard helps users manage their activities. Depending on your role, it may include saved properties, viewing requests, or property management tools.",
  },
  {
    keywords: ["edit profile", "update profile", "change name", "update account", "profile settings"],
    response:
      "You can update your profile details such as your name and contact information through your account settings after logging in.",
  },
  {
    keywords: ["deactivate account", "delete account", "close account"],
    response:
      "If you wish to deactivate or delete your account, please contact the InzuTrust support team through the Contact Us page and they will assist you.",
  },
  {
    keywords: ["create property", "add property", "post property", "upload property"],
    response:
      "Landlords can create new property listings by filling in property details such as title, location, rent amount, bedrooms, bathrooms, description, and property images.",
  },
  {
    keywords: ["update property", "edit property"],
    response:
      "Landlords can update the details of properties they own, including price, description, status, and other important information.",
  },
  {
    keywords: ["delete property", "remove property"],
    response:
      "Landlords can delete their property listings when they are no longer needed or available.",
  },
  {
    keywords: ["available", "occupied", "status"],
    response:
      "Property listings can show whether a property is available or occupied, helping tenants know which homes can still be rented.",
  },
  {
    keywords: ["safe", "security", "secure", "trust"],
    response:
      "InzuTrust is designed to provide a more trustworthy rental experience by organizing listings, user roles, support features, and property information in one platform.",
  },
  {
    keywords: ["privacy", "data", "personal information", "data protection"],
    response:
      "InzuTrust takes user privacy seriously. Your personal information is used only to operate the platform and is not shared with unauthorized third parties.",
  },
  {
    keywords: ["notification", "notifications", "alert", "alerts", "email alert"],
    response:
      "InzuTrust may send you notifications or email alerts for important events such as viewing request updates, account verification, and contact form confirmations.",
  },
  {
    keywords: ["free", "pricing", "subscription", "paid", "cost to use", "fee"],
    response:
      "InzuTrust is designed to make the rental process accessible. For the most up-to-date information on any fees or subscription plans, please visit the platform or contact support.",
  },
  {
    keywords: ["mobile", "app", "phone", "android", "ios", "smartphone"],
    response:
      "InzuTrust is accessible via web browser on both desktop and mobile devices. Check the platform for the latest information on any dedicated mobile app availability.",
  },
  {
    keywords: ["language", "kinyarwanda", "english", "french"],
    response:
      "InzuTrust primarily operates in English. If you need support in another language such as Kinyarwanda or French, please reach out through the Contact Us page.",
  },
  {
    keywords: ["landlord verification", "verified landlord", "trusted landlord"],
    response:
      "InzuTrust works to ensure landlords on the platform are genuine. If you have concerns about a listing or a landlord, please report it through the Contact Us page.",
  },
  {
    keywords: ["report listing", "report property", "fake listing", "suspicious"],
    response:
      "If you come across a suspicious or inaccurate property listing, you can report it by contacting the InzuTrust support team through the Contact Us section.",
  },
  {
    keywords: ["response time", "how long", "wait", "reply time"],
    response:
      "Response times depend on the landlord or support team. After submitting a viewing request or support message, you should receive a response within a reasonable timeframe.",
  },
  {
    keywords: ["lease", "contract", "agreement", "rental agreement"],
    response:
      "InzuTrust helps connect tenants and landlords, but any lease or rental agreement is arranged directly between both parties. Always review your contract carefully before signing.",
  },
  {
    keywords: ["review", "reviews", "rating", "ratings", "feedback"],
    response:
      "InzuTrust may include features for users to leave feedback on their rental experience. Check the platform for the latest information on ratings and reviews.",
  },
  {
    keywords: ["get started", "how to start", "new user", "first time", "begin", "onboarding"],
    response:
      "To get started on InzuTrust: register an account as a tenant or landlord, verify your email, then log in to explore properties, save favorites, request viewings, or manage your listings.",
  },
  {
    keywords: ["where can i find properties", "open properties", "go to properties"],
    response:
      "You can go to the Properties page to browse available listings and use filters to narrow down your search.",
  },
  {
    keywords: ["go to favorites", "open favorites"],
    response:
      "You can open the Favorites section to view the properties you have saved for later.",
  },
  {
    keywords: ["go to contact", "open contact", "contact page"],
    response:
      "You can go to the Contact Us page if you want to send a message to the support team.",
  },
  {
    keywords: ["go to login", "open login"],
    response:
      "You can use the Login page to sign in and access your account features.",
  },
  {
    keywords: ["go to register", "open register"],
    response:
      "You can use the Register page to create a new tenant or landlord account.",
  },
];

const quickSuggestions = [
  "How do I search for properties?",
  "How do favorites work?",
  "How do I request a viewing?",
  "How can landlords upload properties?",
];

const initialMessages = [
  {
    sender: "bot",
    text: "Hi 👋 I'm IRA (Inzu Rental Assistant).Ask me about properties, viewing requests, landlords, tenants, or how to use the platform.",
  },
];

const getBotResponse = (message) => {
  const lower = message.toLowerCase();

  const match = knowledgeBase.find((item) =>
    item.keywords.some((keyword) => lower.includes(keyword))
  );

  return (
    match?.response ||
    "I’m here to help with InzuTrust. You can ask about properties, favorites, viewing requests, landlords, tenants, or platform features."
  );
};

export default function AiChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("inzutrust_chat_history");
    return saved ? JSON.parse(saved) : initialMessages;
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("inzutrust_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setTyping(true);

    setTimeout(() => {
      const botReply = {
        sender: "bot",
        text: getBotResponse(text),
      };

      setMessages((prev) => [...prev, botReply]);
      setTyping(false);
    }, 900);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  const clearChat = () => {
    setMessages(initialMessages);
    localStorage.removeItem("inzutrust_chat_history");
  };

  return (
    <>
      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
  {isOpen ? (
    "×"
  ) : (
    <img src={iraLogo} alt="IRA Assistant" className="chat-logo" />
  )}
</button>
      {isOpen && (
        <div className="chatbox-wrapper">
          <div className="chatbox-header">
            <div>
              <h3>IRA</h3>
              <p>Your Inzu Rental Assistant</p>
            </div>
            <button className="clear-btn" onClick={clearChat}>
              Clear
            </button>
          </div>

          <div className="chatbox-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message-row ${
                  msg.sender === "user" ? "user-row" : "bot-row"
                }`}
              >
                <div className={`chat-message ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="chat-message-row bot-row">
                <div className="chat-message bot typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-suggestions">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-btn"
                onClick={() => sendMessage(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form className="chatbox-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
}