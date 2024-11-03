import React from "react";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { CourseProvider } from "@/context/CourseContext";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Course Platform",
    description: "Learn and grow with our online courses",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                        </div>
                    </div>
                </CourseProvider>
            </body>
        </html>
    );
}
