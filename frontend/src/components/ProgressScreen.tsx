"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar, Trophy, TrendingUp, Book, Clock, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const courses = [
    { id: 1, name: "Sociology", progress: 75, totalLessons: 20, completedLessons: 15 },
    { id: 2, name: "Advanced React Patterns", progress: 60, totalLessons: 15, completedLessons: 9 },
    { id: 3, name: "Blockchain Technology", progress: 40, totalLessons: 25, completedLessons: 10 },
    { id: 4, name: "Data Structures and Algorithms", progress: 90, totalLessons: 30, completedLessons: 27 },
    { id: 5, name: "Cloud Computing Essentials", progress: 30, totalLessons: 20, completedLessons: 6 },
];

const achievements = [
    { id: 1, name: "First Course Completed", icon: Trophy, color: "text-yellow-500" },
    { id: 2, name: "5 Day Streak", icon: Calendar, color: "text-green-500" },
    { id: 3, name: "Top 10% in Quiz", icon: TrendingUp, color: "text-blue-500" },
    { id: 4, name: "Speed Reader", icon: Book, color: "text-purple-500" },
    { id: 5, name: "Night Owl", icon: Clock, color: "text-indigo-500" },
    { id: 6, name: "Goal Crusher", icon: Target, color: "text-red-500" },
];

const weeklyProgress = [
    { day: "Mon", hours: 2, lessons: 4 },
    { day: "Tue", hours: 1.5, lessons: 3 },
    { day: "Wed", hours: 3, lessons: 6 },
    { day: "Thu", hours: 2.5, lessons: 5 },
    { day: "Fri", hours: 1, lessons: 2 },
    { day: "Sat", hours: 4, lessons: 8 },
    { day: "Sun", hours: 3.5, lessons: 7 },
];

const monthlyProgress = [
    { month: "Jan", progress: 20 },
    { month: "Feb", progress: 35 },
    { month: "Mar", progress: 50 },
    { month: "Apr", progress: 40 },
    { month: "May", progress: 60 },
    { month: "Jun", progress: 75 },
];

export function ProgressScreen() {
    const [activeTab, setActiveTab] = useState("overview");

    const totalProgress =
        courses.reduce((sum, course) => sum + course.progress, 0) /
        courses.length;

    const totalLessonsCompleted = courses.reduce((sum, course) => sum + course.completedLessons, 0);
    const totalLessons = courses.reduce((sum, course) => sum + course.totalLessons, 0);

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
                    <div className="grid gap-6 md:grid-cols-2">
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
                                    You've completed {totalLessonsCompleted} out of {totalLessons} lessons.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={monthlyProgress}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Weekly Study Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between h-64">
                                {weeklyProgress.map((day, index) => (
                                    <div
                                        key={day.day}
                                        className="flex flex-col items-center"
                                    >
                                        <motion.div
                                            className="w-12 bg-blue-500 rounded-t flex flex-col items-center justify-end"
                                            initial={{ height: 0 }}
                                            animate={{
                                                height:
                                                    (day.hours / 4) * 100 + "%",
                                            }}
                                            transition={{
                                                delay: index * 0.1,
                                                duration: 0.5,
                                            }}
                                        >
                                            <span className="text-white font-bold mb-1">{day.lessons}</span>
                                        </motion.div>
                                        <span className="mt-2 text-sm">
                                            {day.day}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {day.hours}h
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-center text-sm text-gray-600">
                                Number inside bars represents completed lessons
                            </p>
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
                                                {course.progress}% ({course.completedLessons}/{course.totalLessons} lessons)
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