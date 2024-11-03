"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function SpaceInvaders({ onClose }: { onClose: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        // Player
        const player = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT - 30,
            width: 50,
            height: 30,
            speed: 5,
        };

        // Enemies
        const enemies: {
            x: number;
            y: number;
            width: number;
            height: number;
        }[] = [];
        for (let i = 0; i < 10; i++) {
            enemies.push({
                x: i * 80 + 40,
                y: 40,
                width: 40,
                height: 30,
            });
        }

        // Bullets
        const bullets: {
            x: number;
            y: number;
            width: number;
            height: number;
        }[] = [];

        // Game loop
        const gameLoop = () => {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw player
            ctx.fillStyle = "green";
            ctx.fillRect(player.x, player.y, player.width, player.height);

            // Draw enemies
            ctx.fillStyle = "red";
            enemies.forEach((enemy) => {
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            });

            // Draw bullets
            ctx.fillStyle = "yellow";
            bullets.forEach((bullet) => {
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                bullet.y -= 5;
            });

            // Move enemies
            enemies.forEach((enemy) => {
                enemy.y += 0.2;
                if (enemy.y > CANVAS_HEIGHT) {
                    setGameOver(true);
                }
            });

            // Collision detection
            bullets.forEach((bullet, bulletIndex) => {
                enemies.forEach((enemy, enemyIndex) => {
                    if (
                        bullet.x < enemy.x + enemy.width &&
                        bullet.x + bullet.width > enemy.x &&
                        bullet.y < enemy.y + enemy.height &&
                        bullet.y + bullet.height > enemy.y
                    ) {
                        bullets.splice(bulletIndex, 1);
                        enemies.splice(enemyIndex, 1);
                    }
                });
            });

            if (!gameOver) {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        };

        gameLoop();

        // Event listeners
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && player.x > 0) {
                player.x -= player.speed;
            }
            if (
                e.key === "ArrowRight" &&
                player.x < CANVAS_WIDTH - player.width
            ) {
                player.x += player.speed;
            }
            if (e.key === " ") {
                bullets.push({
                    x: player.x + player.width / 2,
                    y: player.y,
                    width: 5,
                    height: 10,
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameOver]);

    return (
        <div className="flex flex-col items-center justify-center">
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border border-gray-300"
            />
            {gameOver && <p className="text-xl font-bold mt-4">Game Over!</p>}
            <Button onClick={onClose} variant="destructive" className="mt-4">
                Back to Games
            </Button>
        </div>
    );
}
