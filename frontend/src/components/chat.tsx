"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot } from "lucide-react";

const initialMessages = [
    { id: 1, content: "Hello! How can I assist you today?", sender: "bot" },
    {
        id: 2,
        content: "Hi! I have a question about machine learning algorithms.",
        sender: "user",
    },
    {
        id: 3,
        content:
            "Great! I'd be happy to help. What specific aspect of machine learning algorithms would you like to know about?",
        sender: "bot",
    },
];

export default function Chat() {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            setMessages([
                ...messages,
                {
                    id: messages.length + 1,
                    content: newMessage,
                    sender: "user",
                },
            ]);
            setNewMessage("");
            // Simulate bot response
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: prev.length + 1,
                        content:
                            "I'm processing your request. Please give me a moment.",
                        sender: "bot",
                    },
                ]);
            }, 1000);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <Card className="flex-grow flex flex-col">
                <CardHeader>
                    <CardTitle>AI Assistant Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex ${
                                message.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`flex items-end space-x-2 ${
                                    message.sender === "user"
                                        ? "flex-row-reverse space-x-reverse"
                                        : ""
                                }`}
                            >
                                <Avatar>
                                    <AvatarFallback>
                                        {message.sender === "user" ? "U" : "B"}
                                    </AvatarFallback>
                                    <AvatarImage
                                        src={
                                            message.sender === "user"
                                                ? "/user-avatar.png"
                                                : "/bot-avatar.png"
                                        }
                                    />
                                </Avatar>
                                <div
                                    className={`max-w-md p-4 rounded-lg ${
                                        message.sender === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
            </Card>
            <div className="mt-4 flex space-x-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                </Button>
            </div>
        </div>
    );
}
