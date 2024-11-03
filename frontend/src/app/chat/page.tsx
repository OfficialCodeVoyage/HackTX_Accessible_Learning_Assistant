"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Message = {
    id: number;
    text: string;
    sender: "user" | "bot";
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! How can I assist you with your studies today?",
            sender: "bot",
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");

    const handleSendMessage = () => {
        if (inputMessage.trim() === "") return;

        const newMessage: Message = {
            id: messages.length + 1,
            text: inputMessage,
            sender: "user",
        };

        setMessages([...messages, newMessage]);
        setInputMessage("");

        // Simulate bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: messages.length + 2,
                text: "I'm processing your request. How else can I help you with your learning?",
                sender: "bot",
            };
            setMessages((prevMessages) => [...prevMessages, botResponse]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <Card className="flex-grow overflow-hidden">
                <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex-grow overflow-y-auto space-y-4">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${
                                    message.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`flex items-start space-x-2 max-w-[70%] ${
                                        message.sender === "user"
                                            ? "flex-row-reverse space-x-reverse"
                                            : ""
                                    }`}
                                >
                                    <Avatar>
                                        <AvatarFallback>
                                            {message.sender === "user" ? (
                                                <User />
                                            ) : (
                                                <Bot />
                                            )}
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
                                        className={`rounded-lg p-3 ${
                                            message.sender === "user"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        {message.text}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <Input
                            type="text"
                            placeholder="Type your message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleSendMessage()
                            }
                            className="flex-grow"
                        />
                        <Button onClick={handleSendMessage}>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
