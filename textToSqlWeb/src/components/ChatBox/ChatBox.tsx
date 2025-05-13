import React, { useEffect, useState } from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
	
	useEffect(() => {
		const botMessage: Message = {
			sender: "bot",
			text: "Hello! How can I assist you today?",
		}

		const userMessage: Message = {
			sender: "user",
			text: 'Hello',
		}

		setMessages([userMessage, botMessage])
 
	}, []);


  return (
    <div className="w-full max-w-md shadow-lg rounded-lg p-4 flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] ${
                msg.sender === "user"
                  ? "bg-gray-500 text-left"
                  : "bg-blue-500 text-white text-right"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatBox;
