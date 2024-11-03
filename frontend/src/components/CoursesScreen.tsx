"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Brain,
    Cpu,
    ChevronRight,
    Users,
    Search,
} from "lucide-react";
import { useCourse } from "@/context/CourseContext";

const courses = [
    {
        id: 1,
        name: "Machine Learning Fundamentals",
        progress: 65,
        enrolled: 1234,
        duration: "8 weeks",
        icon: Brain,
        color: "from-purple-400 to-indigo-600",
    },
    {
        id: 2,
        name: "Artificial Intelligence: Deep Dive",
        progress: 40,
        enrolled: 987,
        duration: "10 weeks",
        icon: Cpu,
        color: "from-blue-400 to-cyan-600",
    },
    {
        id: 3,
        name: "Data Science Masterclass",
        progress: 80,
        enrolled: 2345,
        duration: "12 weeks",
        icon: BookOpen,
        color: "from-green-400 to-teal-600",
    },
];

export default function CoursesScreen() {
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
    const { setSelectedCourse } = useCourse();

    const filteredCourses = courses.filter((course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        router.push("/dashboard");
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">Explore Courses</h1>
                <div className="relative w-64">
                    <Input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                    <motion.div
                        key={course.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                        onClick={() => handleCourseClick(course)}
                    >
                        <Card>
                            <CardHeader
                                className={`bg-gradient-to-r ${course.color} text-white`}
                            >
                                <course.icon className="h-8 w-8 mb-2" />
                                <CardTitle>{course.name}</CardTitle>
                                <CardDescription className="text-white/80">
                                    Enroll now and start learning
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-4">
                                <Progress
                                    value={course.progress}
                                    className="h-2 mb-2"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{course.progress}% Complete</span>
                                    <span>{course.duration}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 mr-1" />
                                    {course.enrolled} enrolled
                                </div>
                                <Button variant="ghost" size="sm">
                                    Learn More{" "}
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
