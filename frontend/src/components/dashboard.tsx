"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Book, Clock, Trophy, TrendingUp } from "lucide-react";
import { useCourse } from "@/context/CourseContext";

const stats = [
    { title: "Lessons Completed", value: 12, icon: Book, color: "bg-blue-500" },
    { title: "Hours Studied", value: 28, icon: Clock, color: "bg-green-500" },
    { title: "Quizzes Passed", value: 8, icon: Trophy, color: "bg-yellow-500" },
    {
        title: "Current Streak",
        value: 7,
        icon: TrendingUp,
        color: "bg-red-500",
    },
];

const recentLessons = [
    { id: 1, name: "Introduction to Neural Networks", progress: 100 },
    { id: 2, name: "Supervised vs Unsupervised Learning", progress: 75 },
    { id: 3, name: "Deep Learning Architectures", progress: 50 },
];

export function Dashboard() {
    const { selectedCourse } = useCourse();

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">
                {selectedCourse ? selectedCourse.name : "Dashboard"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="flex items-center p-6">
                                <div
                                    className={`p-4 rounded-full ${stat.color}`}
                                >
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <h2 className="text-3xl font-bold">
                                        {stat.value}
                                    </h2>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {recentLessons.map((lesson, index) => (
                            <motion.div
                                key={lesson.id}
                                initial={{
                                    opacity: 0,

                                    x: -20,
                                }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium">
                                        {lesson.name}
                                    </h3>
                                    <span className="text-sm text-muted-foreground">
                                        {lesson.progress}%
                                    </span>
                                </div>
                                <Progress
                                    value={lesson.progress}
                                    className="h-2"
                                />
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button size="lg" className="w-full md:w-auto">
                    Continue Learning
                </Button>
            </div>
        </div>
    );
}
