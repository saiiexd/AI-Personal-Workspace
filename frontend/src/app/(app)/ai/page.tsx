"use client";

import { useState, useEffect, useRef } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { useAI } from "@/hooks/use-ai";
import { Send, Bot, User, Plus, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIPage() {
  const { conversations, isConversationsLoading, createConversation, deleteConversation } = useAI();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Auto-select first conversation or create one if none exist
  useEffect(() => {
    if (!isConversationsLoading && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, isConversationsLoading, activeConversationId]);

  const handleNewConversation = async () => {
    const newConv = await createConversation.mutateAsync("New Conversation");
    setActiveConversationId(newConv.id);
  };

  return (
    <PageTransition className="h-[calc(100vh-8rem)] flex overflow-hidden rounded-2xl border border-border bg-card">
      {/* Sidebar - Conversation List */}
      <div className="w-64 border-r border-border bg-background/50 flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <Typography variant="muted" className="font-medium text-foreground">Chat History</Typography>
          <Button variant="ghost" size="icon" onClick={handleNewConversation}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {isConversationsLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${
                  activeConversationId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-card text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">{conv.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation.mutateAsync(conv.id);
                    if (activeConversationId === conv.id) setActiveConversationId(null);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card">
        {activeConversationId ? (
          <ChatArea conversationId={activeConversationId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <Typography variant="h3" className="mb-2">AI Assistant</Typography>
            <Typography variant="muted" className="mb-6 max-w-md">
              Ask questions, generate ideas, or analyze your workspace data (documents, notes, tasks).
            </Typography>
            <Button onClick={handleNewConversation}>Start a new conversation</Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function ChatArea({ conversationId }: { conversationId: string }) {
  const { messages, isMessagesLoading, sendMessage } = useAI(conversationId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;
    
    const userMessage = input;
    setInput("");
    
    try {
      await sendMessage.mutateAsync({ content: userMessage });
    } catch (error) {
      console.error("Failed to send message", error);
      // Restore input on failure
      setInput(userMessage);
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {isMessagesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Bot className="w-12 h-12 mb-4 opacity-20" />
            <p>Send a message to start chatting</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 max-w-3xl mx-auto ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-muted text-foreground rounded-tl-sm"
              }`}>
                {msg.content === "..." ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/50">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AI..."
            className="w-full bg-card border border-border rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:border-primary transition-colors"
            disabled={sendMessage.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 top-2 rounded-full w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!input.trim() || sendMessage.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
