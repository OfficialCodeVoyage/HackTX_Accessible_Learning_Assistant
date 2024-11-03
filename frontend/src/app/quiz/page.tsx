"use client"; 

import React, { useState } from "react";
import Image from "next/image";
import { MCQQuiz } from "@/components/mcq-quiz";
import { SpaceInvaders } from "./space-invaders";
import {MarioRun} from "./mario-run";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarryBackground from "./StarryBackground"; // Import your starry background component

interface Game {
  id: string;
  title: string;
  image: string;
}

const games: Game[] = [
  {
    id: "space-invaders",
    title: "Space Invaders",
    image: "/images/space-invaders.jpg",
  },
  {
    id: "mario-run",
    title: "Mario Run",
    image: "/images/mario-run.jpg",
  },
  {
    id: "mcq",
    title: "MCQ Quiz",
    image: "/images/mcq-quiz.jpg",
  },
];

export default function ArcadeQuizPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarryBackground className="absolute inset-0 z-0" />
      <div className="relative z-10 p-8">
        <h1 className="text-6xl font-bold text-neon-pink mb-8 text-center neon-text">
          Quiz Games
        </h1>
        {!selectedGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {games.map((game) => (
              <Card
                key={game.id}
                className="overflow-hidden transform transition-all hover:scale-105 focus-within:ring-2 focus-within:ring-neon-blue bg-black bg-opacity-50 border-neon-blue"
              >
                <Button
                  variant="ghost"
                  className="w-full h-full p-0 hover:bg-transparent"
                  onClick={() => handleGameSelect(game.id)}
                >
                  <Image
                    src={game.image}
                    alt={game.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h2 className="text-xl font-semibold text-neon-green neon-text">
                      {game.title}
                    </h2>
                  </CardContent>
                </Button>
              </Card>
            ))}
          </motion.div>
        )}
        {selectedGame === "mcq" && (
          <MCQQuiz onClose={() => setSelectedGame(null)} />
        )}
        {selectedGame === "space-invaders" && (
          <SpaceInvaders onClose={() => setSelectedGame(null)} />
        )}
         {selectedGame === "mario-run" && (
          <MarioRun onClose={() => setSelectedGame(null)} />
        )}
        {selectedGame && selectedGame !== "mcq" && selectedGame !== "space-invaders" && (
          <Card className="max-w-2xl mx-auto bg-black bg-opacity-50 border-neon-pink">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-neon-green neon-text">
                {games.find((g) => g.id === selectedGame)?.title}
              </h2>
              <p className="mb-4 text-neon-blue">
                Game content for{" "}
                {games.find((g) => g.id === selectedGame)?.title} goes here...
              </p>
              <Button
                onClick={() => setSelectedGame(null)}
                variant="outline"
                className="transition-colors border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
              >
                Back to Games
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
        body {
          font-family: "Press Start 2P", cursive;
          background-color: #000;
          color: #fff;
        }
        .neon-text {
          text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff00de,
            0 0 35px #ff00de, 0 0 40px #ff00de, 0 0 50px #ff00de, 0 0 75px #ff00de;
        }
        .border-neon-blue {
          box-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff, 0 0 20px #0ff;
        }
        .border-neon-pink {
          box-shadow: 0 0 5px #f0f, 0 0 10px #f0f, 0 0 15px #f0f, 0 0 20px #f0f;
        }
      `}</style>
    </div>
  );
}
