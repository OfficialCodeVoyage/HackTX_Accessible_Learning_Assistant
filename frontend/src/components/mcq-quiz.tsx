"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const mcqQuestions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: "Paris",
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
    },
    {
        question: "Who painted the Mona Lisa?",
        options: [
            "Vincent van Gogh",
            "Pablo Picasso",
            "Leonardo da Vinci",
            "Michelangelo",
        ],
        correctAnswer: "Leonardo da Vinci",
    },
];

export function MCQQuiz({ onClose }: { onClose: () => void }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleAnswerSubmit = () => {
        if (selectedAnswer === mcqQuestions[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }

        if (currentQuestion + 1 < mcqQuestions.length) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer("");
        } else {
            setQuizCompleted(true);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer("");
        setQuizCompleted(false);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-3xl font-bold mb-4 text-gray-800">
                    MCQ Quiz
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!quizCompleted ? (
                    <>
                        <p className="mb-4 text-gray-600">
                            Question {currentQuestion + 1} of{" "}
                            {mcqQuestions.length}
                        </p>
                        <h3 className="text-xl font-semibold mb-4">
                            {mcqQuestions[currentQuestion].question}
                        </h3>
                        <RadioGroup
                            value={selectedAnswer}
                            onValueChange={setSelectedAnswer}
                            className="space-y-2"
                        >
                            {mcqQuestions[currentQuestion].options.map(
                                (option, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-2"
                                    >
                                        <RadioGroupItem
                                            value={option}
                                            id={`option-${index}`}
                                        />
                                        <Label htmlFor={`option-${index}`}>
                                            {option}
                                        </Label>
                                    </div>
                                )
                            )}
                        </RadioGroup>
                        <div className="mt-6 space-x-4">
                            <Button
                                onClick={handleAnswerSubmit}
                                disabled={!selectedAnswer}
                            >
                                {currentQuestion === mcqQuestions.length - 1
                                    ? "Finish"
                                    : "Next"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            Quiz Completed!
                        </h3>
                        <p className="mb-4 text-gray-600">
                            Your score: {score} out of {mcqQuestions.length}
                        </p>
                        <div className="space-x-4">
                            <Button onClick={restartQuiz}>Restart Quiz</Button>
                            <Button onClick={onClose} variant="outline">
                                Back to Games
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
