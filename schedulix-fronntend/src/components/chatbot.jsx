// src/components/Chatbot.jsx

import React, { useState } from "react";
import { InvokeLLM } from "@/utils"; // Corrected import path
import { Sparkles, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your Schedulix AI assistant. I can help you with scheduling, faculty information, and answering questions about the platform. How can I help you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await InvokeLLM({
        prompt: `You are Schedulix AI, a helpful assistant for a student-faculty scheduling platform. 
        The user asked: "${userMessage}"
        
        Context about Schedulix:
        - Students can check faculty availability in real-time
        - Students can schedule meetings with faculty members
        - The platform shows faculty status (Available, In Class, In Meeting, Off Campus)
        - Meetings can be scheduled by selecting date, time, and purpose
        
        Provide a helpful, friendly, and concise response. Keep it under 3 sentences when possible.`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again." 
      }]);
      console.error(error);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#9B8CFF] to-[#89BFFF] hover:opacity-90 shadow-2xl z-50 glow-effect"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        )}
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <Card className="fixed bottom-28 right-8 w-96 h-[500px] shadow-2xl rounded-3xl border-none overflow-hidden z-50">
          <CardHeader className="bg-gradient-to-r from-[#9B8CFF] to-[#89BFFF] text-white p-6">
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Sparkles className="w-5 h-5" />
              Ask Schedulix 🤖
            </CardTitle>
            <p className="text-sm text-white/80">Your AI scheduling assistant</p>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[calc(100%-88px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-[#C8B6FF] to-[#A8C7FF] text-white"
                          : "bg-gradient-to-br from-[#B8E1FF]/30 to-[#A8C7FF]/30 text-gray-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-[#B8E1FF]/30 to-[#A8C7FF]/30 p-4 rounded-2xl">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-[#9B8CFF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-[#9B8CFF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-[#9B8CFF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="rounded-full border-gray-200"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="rounded-full bg-gradient-to-r from-[#9B8CFF] to-[#89BFFF] hover:opacity-90"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}