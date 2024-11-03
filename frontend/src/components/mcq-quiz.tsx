"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function QuizComponent({ onClose }: { onClose: () => void }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/mcq?num_questions=10", {
                method: "POST",
            });
            const data = await response.json();
            console.log("Fetched questions:", data.multiple_choice_questions);
            setQuestions(data.multiple_choice_questions);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = () => {
        if (selectedAnswer === questions[currentQuestion].correct_answer) {
            setScore(score + 1);
        }

        if (currentQuestion + 1 < questions.length) {
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
        fetchQuestions();
    };

    if (loading) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="flex justify-center items-center h-64">
                    <div className="arcade-loader"></div>
                </CardContent>
            </Card>
        );
    }

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
                            Question {currentQuestion + 1} of {questions.length}
                        </p>
                        <h3 className="text-xl font-semibold mb-4">
                            {questions[currentQuestion].question}
                        </h3>
                        <RadioGroup
                            value={selectedAnswer}
                            onValueChange={setSelectedAnswer}
                            className="space-y-2"
                        >
                            {Object.entries(questions[currentQuestion].choices).map(
                                ([key, choice]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <RadioGroupItem value={key} id={`option-${key}`} />
                                        <Label htmlFor={`option-${key}`}>{choice}</Label>
                                    </div>
                                )
                            )}
                        </RadioGroup>
                        <div className="mt-6 space-x-4">
                            <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
                                {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                            </Button>
                            {/* Exit Quiz Button */}
                            <Button onClick={onClose} variant="outline">
                                Exit Quiz
                            </Button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Quiz Completed!</h3>
                        <p className="mb-4 text-gray-600">Your score: {score} out of {questions.length}</p>
                        <div className="space-x-4">
                            <Button onClick={restartQuiz}>Restart Quiz</Button>
                            <Button onClick={onClose} variant="outline">
                                Back to Games
                            </Button>
                            {/* Exit Quiz Button after completion */}
                            <Button onClick={onClose} variant="outline">
                                Exit Quiz
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
