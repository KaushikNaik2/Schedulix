// src/utils/index.js

import { Sparkles } from "lucide-react";

/**
 * Maps page names to their corresponding URL paths.
 */
export const createPageUrl = (pageName) => {
  switch (pageName) {
    case "Dashboard":
      return "/";
    case "Availability":
      return "/availability";
    case "Schedule":
      return "/schedule";
    default:
      return "/";
  }
};

/**
 * Mock LLM Integration - Used in Chatbot.jsx
 */
export const InvokeLLM = async ({ prompt, add_context_from_internet }) => {
  console.log("LLM Mock Prompt:", prompt);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  
  // Simple canned response based on context
  if (prompt.toLowerCase().includes("schedule")) {
      return "To schedule a meeting, click on the 'Schedule' tab or the 'Schedule a Meeting' quick action on the dashboard. You can choose an available faculty member, select a date and time, and specify the purpose.";
  }
  if (prompt.toLowerCase().includes("availability")) {
      return "Faculty availability can be checked in real-time on the 'Faculty' page. Look for the status badge next to their name (Available, In Class, etc.).";
  }
  
  return "Hello! I'm Schedulix AI. I can help you find faculty availability or guide you through the scheduling process. How can I assist you with your academic planning today? 😊";
};