"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { apiService } from "@/lib/api-service";
import { ChatMessage, ChatbotRequest, ChatbotSource } from "@/types/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface ExtendedChatMessage extends ChatMessage {
  sources?: ChatbotSource[];
}

interface ChatbotPopupProps {
  className?: string;
}

export function ChatbotPopup({ className }: ChatbotPopupProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ExtendedChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const chatRequest: ChatbotRequest = {
        query: userMessage.content,
        conversation_id: conversationId,
        user_id: user?.id || "anonymous",
      };

      const response = await apiService.sendChatMessage(chatRequest);

      if (response.code === 200 && response.data) {
        // Extract the main answer by removing the "Nguồn:" section
        let cleanAnswer = response.data.answer;
        const sourceIndex = cleanAnswer.indexOf("\n\nNguồn:");
        if (sourceIndex !== -1) {
          cleanAnswer = cleanAnswer.substring(0, sourceIndex).trim();
        }

        const botMessage: ExtendedChatMessage = {
          id: (Date.now() + 1).toString(),
          content: cleanAnswer || "Xin lỗi, tôi không thể trả lời câu hỏi này.",
          isUser: false,
          timestamp: new Date().toISOString(),
          sources: response.data.sources,
        };

        setMessages((prev) => [...prev, botMessage]);

        // Update conversation ID if provided
        if (response.data.conversation_id) {
          setConversationId(response.data.conversation_id);
        }
      } else {
        throw new Error(response.message || "Có lỗi xảy ra khi gửi tin nhắn");
      }
    } catch (error) {
      const errorMessage: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chatbot error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  // Function to convert URLs in text to clickable links
  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Floating action button
  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Mở chatbot</span>
        </Button>
      </div>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="bg-background border rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Chatbot Hỗ trợ</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {messages.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {messages.filter((m) => !m.isUser).length} tin nhắn từ bot
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full chat dialog
  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <div className="bg-background border rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Chatbot Hỗ trợ</span>
          </div>
          <div className="flex gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetChat}
                className="h-8 w-8"
                title="Bắt đầu cuộc trò chuyện mới"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">
                  Chào bạn! Tôi có thể giúp gì cho bạn?
                </p>
                <p className="text-sm mt-2">
                  Hỏi tôi về các bài viết trên blog...
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <p className="font-medium text-muted-foreground/80">Ví dụ:</p>
                  <div className="space-y-1">
                    <p
                      className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted"
                      onClick={() =>
                        setInputMessage("Có bài viết nào về giao thông không?")
                      }
                    >
                      &quot;Cho tôi thông tin về bài viết về giao thông&quot;
                    </p>
                    <p
                      className="bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted"
                      onClick={() =>
                        setInputMessage("Tìm bài viết về công nghệ")
                      }
                    >
                      &quot;Tìm bài viết về công nghệ&quot;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.isUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    message.isUser
                      ? "bg-primary text-black bg-blue-100"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap">
                    {formatTextWithLinks(message.content)}
                  </div>

                  {/* Display sources if available */}
                  {!message.isUser &&
                    message.sources &&
                    message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-muted-foreground/20">
                        <p className="text-xs font-medium mb-2 opacity-80">
                          Nguồn tham khảo:
                        </p>
                        {message.sources.map((source, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline block font-medium flex items-center gap-1"
                            >
                              {source.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {source.highlights &&
                              source.highlights.length > 0 && (
                                <p className="text-xs opacity-70 mt-1 truncate">
                                  &quot;{source.highlights[0].substring(0, 100)}
                                  ...&quot;
                                </p>
                              )}
                          </div>
                        ))}
                      </div>
                    )}

                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
