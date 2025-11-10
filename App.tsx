
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, Part } from './types';
import { GeminiIcon, SparklesIcon } from './components/icons';
import { MessageInput } from './components/MessageInput';
import { ChatBubble } from './components/ChatBubble';
import { startChat, fileToGenerativePart } from './services/geminiService';

export default function App() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const initializeChat = useCallback(() => {
    try {
      const newChat = startChat();
      setChat(newChat);
      setChatHistory([
        {
          role: 'model',
          parts: [{ text: "Hello! I'm a Gemini clone. How can I help you today?" }],
        },
      ]);
      setError(null);
    } catch (e) {
      console.error("Failed to initialize chat:", e);
      setError("Failed to initialize the AI. Please check your API key and refresh the page.");
    }
  }, []);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (userInput: string, userImage: File | null) => {
    if (isLoading || (!userInput.trim() && !userImage)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const userParts: Part[] = [];
    if (userImage) {
      try {
        const imagePart = await fileToGenerativePart(userImage);
        userParts.push(imagePart);
      } catch (e) {
        console.error("Error processing image:", e);
        setError("There was an error processing your image. Please try again.");
        setIsLoading(false);
        return;
      }
    }
    if (userInput.trim()) {
      userParts.push({ text: userInput });
    }

    const userMessage: ChatMessage = { role: 'user', parts: userParts };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      if (!chat) {
        throw new Error("Chat is not initialized.");
      }
      
      const stream = await chat.sendMessageStream({ message: userParts });

      let modelResponse = '';
      setChatHistory((prev) => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          modelResponse += chunkText;
          setChatHistory((prev) => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].parts[0].text = modelResponse;
            return newHistory;
          });
        }
      }
    } catch (e) {
      console.error("Error sending message:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, something went wrong. ${errorMessage}`);
      setChatHistory((prev) => prev.slice(0, -1)); // Remove the empty model bubble
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-on-surface">
      <header className="flex items-center p-4 border-b border-surface">
        <GeminiIcon className="h-8 w-8 text-primary" />
        <h1 className="ml-3 text-xl font-medium text-on-surface-variant">Gemini Chat Clone</h1>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {chatHistory.map((message, index) => (
          <ChatBubble
            key={index}
            message={message}
            isStreaming={isLoading && index === chatHistory.length - 1}
          />
        ))}
        {chatHistory.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
              <SparklesIcon className="w-16 h-16 mb-4" />
              <p className="text-2xl">How can I help you today?</p>
            </div>
        )}
      </main>

      <footer className="p-4 md:p-6 bg-background">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
}