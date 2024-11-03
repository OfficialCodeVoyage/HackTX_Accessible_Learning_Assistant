import React from "react";
import { Dashboard } from "@/components/dashboard";

export const metadata = {
    title: "EduVerse - Dashboard",
    description: "View your course progress and recent activities",
};

export default function DashboardPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Dashboard />
        </div>
    );
}
