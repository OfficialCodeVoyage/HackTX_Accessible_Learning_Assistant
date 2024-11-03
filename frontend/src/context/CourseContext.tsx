"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Course = {
    id: number;
    name: string;
};

type CourseContextType = {
    selectedCourse: Course | null;
    setSelectedCourse: (course: Course | null) => void;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    useEffect(() => {
        const storedCourse = localStorage.getItem("selectedCourse");
        if (storedCourse) {
            setSelectedCourse(JSON.parse(storedCourse));
        }
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            localStorage.setItem(
                "selectedCourse",
                JSON.stringify(selectedCourse)
            );
        } else {
            localStorage.removeItem("selectedCourse");
        }
    }, [selectedCourse]);

    return (
        <CourseContext.Provider value={{ selectedCourse, setSelectedCourse }}>
            {children}
        </CourseContext.Provider>
    );
}

export function useCourse() {
    const context = useContext(CourseContext);
    if (context === undefined) {
        throw new Error("useCourse must be used within a CourseProvider");
    }
    return context;
}
