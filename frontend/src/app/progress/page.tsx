import React from "react";
import { ProgressScreen } from "@/components/ProgressScreen";

export const metadata = {
    title: "Your Progress | EduVerse",
    description: "Track your learning progress on EduVerse",
};

export default function ProgressPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <ProgressScreen />
        </div>
    );
}
