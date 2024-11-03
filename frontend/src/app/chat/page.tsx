"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input"; // Ensure you import your custom UI components correctly
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Mic, MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

// Initial chat messages to display
const initialMessages = [
    { id: 1, content: "Hello! How can I assist you today?", sender: "bot" }
];

export default function Chat() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const recognizer = useRef<SpeechRecognition | null>(null);
    const pauseTimer = useRef<NodeJS.Timeout | null>(null);
    const PAUSE_TIME = 2000; // 2-second pause time

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (messageContent: string) => {
        if (messageContent.trim()) {
            const userMessage = {
                id: messages.length + 1,
                content: messageContent,
                sender: "user",
            };
            setMessages((prev) => [...prev, userMessage]);
            setNewMessage("");

            // Simulate API call for response
            setIsLoading(true);
            fetch(`http://localhost:8000/query?query=${encodeURIComponent(messageContent)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            .then(response => response.json())
            .then(data => {
                const botResponse = {
                    id: messages.length + 2,
                    content: data.answer || "I'm processing your request. Please give me a moment.",
                    sender: "bot",
                };
                setMessages((prev) => [...prev, botResponse]);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error:", error);
                setMessages((prev) => [
                    ...prev,
                    { id: messages.length + 2, content: "Sorry, there was an error processing your question.", sender: "bot" }
                ]);
                setIsLoading(false);
            });
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognizer.current = SpeechRecognition ? new SpeechRecognition() : null;

        if (recognizer.current) {
            setIsListening(true);
            recognizer.current.continuous = true;
            recognizer.current.interimResults = true;
            recognizer.current.start();

            recognizer.current.onresult = (event) => {
                const result = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setNewMessage(result);

                if (pauseTimer.current) {
                    clearTimeout(pauseTimer.current);
                }

                pauseTimer.current = setTimeout(() => {
                    if (result.trim()) {
                        handleSendMessage(result);
                    }
                }, PAUSE_TIME);
            };

            recognizer.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }
    };

    const stopListening = () => {
        if (recognizer.current) {
            recognizer.current.stop();
        }
        setIsListening(false);
        if (pauseTimer.current) {
            clearTimeout(pauseTimer.current);
        }
        if (newMessage.trim()) {
            handleSendMessage(newMessage);
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
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex items-end space-x-2 ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                                <Avatar>
                                    <AvatarFallback>{message.sender === "user" ? "U" : "B"}</AvatarFallback>
                                    <AvatarImage src={message.sender === "user" ? "/user-avatar.png" : "/bot-avatar.png"} />
                                </Avatar>
                                <div className={`max-w-md p-4 rounded-lg ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
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
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(newMessage)}
                />
                <Button onClick={() => handleSendMessage(newMessage)} disabled={isLoading}>
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Loading..." : "Send"}
                </Button>
                {!isListening ? (
                    <Button onClick={startListening}>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Listening
                    </Button>
                ) : (
                    <Button onClick={stopListening}>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Listening
                    </Button>
                )}
            </div>
            {isListening && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                    Current speech: {newMessage}
                </div>
            )}
        </div>
    );
}
