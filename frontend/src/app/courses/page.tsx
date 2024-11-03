import React from "react";
import CoursesScreen from "@/components/CoursesScreen";

export const metadata = {
    title: "Courses | EduVerse",
    description: "Explore our wide range of courses in EduVerse",
};

export default function CoursesPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <CoursesScreen />
        </div>
    );
}
