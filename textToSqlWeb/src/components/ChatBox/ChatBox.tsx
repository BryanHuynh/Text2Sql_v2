import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

export type Message = {
  sender: "user" | "bot";
  text: string;
};
export type ChatBoxHandle = {
  updateMessages: (message: Message) => void;
};

export interface ChatBoxRef {
  isLoading?: boolean;
}

const ChatBox = forwardRef<ChatBoxHandle, ChatBoxRef>(({ isLoading }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useImperativeHandle(ref, () => ({
    updateMessages: (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    },
  }));

  useEffect(() => {
    console.log(isLoading);
  }, [isLoading]);

  if (messages.length == 0) return;
  return (
    <div className="w-full max-w-1/2 shadow-lg rounded-lg p-4 flex flex-col h-[600px]">
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
        {isLoading ? (
          <div className="flex justify-end px-4 py-5">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white text-right"></div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
});

export default ChatBox;
