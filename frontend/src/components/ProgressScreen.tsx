"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar, Trophy, TrendingUp } from "lucide-react";

const courses = [
    { id: 1, name: "Machine Learning Fundamentals", progress: 75 },
    { id: 2, name: "Advanced React Patterns", progress: 60 },
    { id: 3, name: "Blockchain Technology", progress: 40 },
    { id: 4, name: "Data Structures and Algorithms", progress: 90 },
    { id: 5, name: "Cloud Computing Essentials", progress: 30 },
];

const achievements = [
    {
        id: 1,
        name: "First Course Completed",
        icon: Trophy,
        color: "text-yellow-500",
    },
    { id: 2, name: "5 Day Streak", icon: Calendar, color: "text-green-500" },
    {
        id: 3,
        name: "Top 10% in Quiz",
        icon: TrendingUp,
        color: "text-blue-500",
    },
];

const weeklyProgress = [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 1.5 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 2.5 },
    { day: "Fri", hours: 1 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 3.5 },
];

export function ProgressScreen() {
    const [activeTab, setActiveTab] = useState("overview");

    const totalProgress =
        courses.reduce((sum, course) => sum + course.progress, 0) /
        courses.length;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Your Learning Progress</h1>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                <div className="relative w-48 h-48">
                                    <svg
                                        className="w-full h-full"
                                        viewBox="0 0 100 100"
                                    >
                                        <circle
                                            className="text-gray-200 stroke-current"
                                            strokeWidth="10"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                        ></circle>
                                        <motion.circle
                                            className="text-blue-600 progress-ring__circle stroke-current"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            initial={{
                                                strokeDasharray: "0 251.2",
                                            }}
                                            animate={{
                                                strokeDasharray: `${
                                                    totalProgress * 2.512
                                                } 251.2`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                ease: "easeInOut",
                                            }}
                                        ></motion.circle>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl font-bold">
                                            {Math.round(totalProgress)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="mt-4 text-center text-xl font-semibold">
                                Keep up the great work!
                            </h3>
                            <p className="mt-2 text-center text-gray-600">
                                You're making steady progress in your courses.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Weekly Study Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between h-64">
                                {weeklyProgress.map((day, index) => (
                                    <div
                                        key={day.day}
                                        className="flex flex-col items-center"
                                    >
                                        <motion.div
                                            className="w-8 bg-blue-500 rounded-t"
                                            initial={{ height: 0 }}
                                            animate={{
                                                height:
                                                    (day.hours / 4) * 100 + "%",
                                            }}
                                            transition={{
                                                delay: index * 0.1,
                                                duration: 0.5,
                                            }}
                                        ></motion.div>
                                        <span className="mt-2 text-sm">
                                            {day.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="courses">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {courses.map((course) => (
                                    <div key={course.id}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">
                                                {course.name}
                                            </span>
                                            <span className="text-sm font-medium">
                                                {course.progress}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={course.progress}
                                            className="h-2"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="achievements">
                    <div className="grid gap-6 md:grid-cols-3">
                        {achievements.map((achievement) => (
                            <Card key={achievement.id}>
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <achievement.icon
                                        className={`h-12 w-12 ${achievement.color}`}
                                    />
                                    <h3 className="mt-4 text-lg font-semibold text-center">
                                        {achievement.name}
                                    </h3>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
