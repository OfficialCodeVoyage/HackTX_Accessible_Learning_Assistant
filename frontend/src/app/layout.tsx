'use client'

import React, { useEffect, useState, useCallback, useRef } from "react"
import { Inter } from "next/font/google"
import { CourseProvider } from "@/context/CourseContext"
import { Sidebar } from "@/components/sidebar"
import { useRouter } from 'next/navigation'
import { Mic, MicOff } from 'lucide-react'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isListening, setIsListening] = useState(false)
    const router = useRouter()

    const handleVoiceCommand = useCallback((command: string) => {
        console.log('Voice command received:', command)
        const lowerCommand = command.toLowerCase()

        if (lowerCommand.includes('go to dashboard') || lowerCommand.includes('open home')) {
            router.push('/dashboard')
        } else if (lowerCommand.includes('go to courses') || lowerCommand.includes('show classes')) {
            router.push('/courses')
        } else if (lowerCommand.includes('go to chat') || lowerCommand.includes('open messages')) {
            router.push('/chat')
        } else if (lowerCommand.includes('go to upload') || lowerCommand.includes('submit file')) {
            router.push('/upload')
        } else if (lowerCommand.includes('go to progress') || lowerCommand.includes('show status')) {
            router.push('/progress')
        } else if (lowerCommand.includes('go to quiz') || lowerCommand.includes('start test')) {
            router.push('/quiz')
        } else {
            console.log("Command not recognized. Please try again.")
        }
    }, [router])

    const startListening = useCallback(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            const recognition = new SpeechRecognition()
            recognition.continuous = false
            recognition.interimResults = false
            recognition.lang = 'en-US'

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const command = event.results[0][0].transcript
                handleVoiceCommand(command)
            }

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)
            }

            recognition.onend = () => {
                if (isListening) {
                    recognition.start()
                }
            }

            recognition.start()
        } else {
            console.error('Speech recognition is not supported in this browser')
        }
    }, [handleVoiceCommand, isListening])

    useEffect(() => {
        return () => {
            // Cleanup logic if needed
        }
    }, [])

    useEffect(() => {
        if (isListening) {
            startListening()
        } else {
            if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                const recognition = new SpeechRecognition()
                recognition.abort()
            }
        }
    }, [isListening, startListening])

    const toggleVoiceNavigation = () => {
        setIsListening(prev => !prev)
    }

    return (
        <html lang="en">
            <body className={inter.className}>
                <CourseProvider>
                    <div className="flex h-screen bg-background">
                        <Sidebar />
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <main className="flex-1 overflow-y-auto p-6">
                                {children}
                            </main>
                            <button
                                onClick={toggleVoiceNavigation}
                                className={`fixed bottom-4 right-4 p-4 rounded-full ${
                                    isListening ? 'bg-green-500' : 'bg-blue-500'
                                } text-white shadow-lg transition-colors duration-300`}
                                aria-label={isListening ? 'Disable voice navigation' : 'Enable voice navigation'}
                            >
                                {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </CourseProvider>
            </body>
        </html>
    )
}
