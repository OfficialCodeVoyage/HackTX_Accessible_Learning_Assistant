'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState, useCallback } from 'react'

type Question = {
  question: string;
  choices: { A: string; B: string; C: string; D: string; };
  correct_answer: string;
}

interface SpaceInvadersProps {
  questions: Question[];
  onClose: () => void;
}

const CANVAS_WIDTH = 1500
const CANVAS_HEIGHT = 600
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 30
const PLAYER_SPEED = 20
const BULLET_SPEED = 7
const ENEMY_SPEED = 0.5

export function SpaceInvaders({ questions, onClose }: SpaceInvadersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    currentQuestionIndex: 0,
    playerX: CANVAS_WIDTH / 2,
    bullets: [] as { x: number; y: number }[],
    enemies: [] as { x: number; y: number; text: string; width: number }[],
    gameOver: false,
    gameWon: false,
  })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const requestRef = useRef<number>()
  const imagesRef = useRef({
    background: new Image(),
    player: new Image(),
    enemy1: new Image(),
    enemy2: new Image(),
    enemy3: new Image(),
  })
  const soundsRef = useRef({
    shoot: new Audio('/sounds/shoot.wav'),
    enemyDeath: new Audio('/sounds/enemy-death.wav'),
    positive: new Audio('/sounds/collect.wav'),
    negative: new Audio('/sounds/hit.wav'),
  })

  useEffect(() => {
    imagesRef.current.background.src = '/images/space.png'
    imagesRef.current.player.src = '/images/player.png'
    imagesRef.current.enemy1.src = '/images/enemy1.png'
    imagesRef.current.enemy2.src = '/images/enemy2.png'
    imagesRef.current.enemy3.src = '/images/enemy3.png'
    soundsRef.current.shoot.volume = 0.1
    soundsRef.current.enemyDeath.volume = 0.1
    soundsRef.current.positive.volume = 0.1
    soundsRef.current.negative.volume = 0.1
  }, [])

  const initializeEnemies = useCallback(() => {
    const { currentQuestionIndex } = gameStateRef.current
    if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex]
      gameStateRef.current.enemies = Object.entries(currentQuestion.choices).map(([key, value], index) => ({
        x: (index + 1) * (CANVAS_WIDTH / 5),
        y: 50,
        text: `${key}: ${value}`,
        width: 80
      }))
    } else {
      gameStateRef.current.gameWon = true
      setGameEnded(true)
    }
  }, [questions])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { playerX } = gameStateRef.current
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      gameStateRef.current.playerX = Math.min(playerX + PLAYER_SPEED, CANVAS_WIDTH - PLAYER_WIDTH)
    }
    if (e.key === 'Left' || e.key === 'ArrowLeft') {
      gameStateRef.current.playerX = Math.max(playerX - PLAYER_SPEED, 0)
    }
    if (e.key === ' ') {
      gameStateRef.current.bullets.push({ x: playerX + PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10 })
      soundsRef.current.shoot.currentTime = 0
      soundsRef.current.shoot.play()
    }
  }, [])

  const updateGameState = useCallback(() => {
    const gameState = gameStateRef.current
    gameState.bullets = gameState.bullets.filter(bullet => {
      bullet.y -= BULLET_SPEED
      return bullet.y > 0
    })
    gameState.enemies = gameState.enemies.map(enemy => ({ ...enemy, y: enemy.y + ENEMY_SPEED }))

    let correctAnswerHit = false
    gameState.bullets.forEach(bullet => {
      gameState.enemies = gameState.enemies.filter(enemy => {
        if (
          bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
          bullet.y > enemy.y && bullet.y < enemy.y + 30
        ) {
          if (enemy.text.startsWith(questions[gameState.currentQuestionIndex].correct_answer)) {
            gameState.score += 100
            gameState.currentQuestionIndex++
            correctAnswerHit = true
            soundsRef.current.positive.currentTime = 0
            soundsRef.current.positive.play()
            if (gameState.currentQuestionIndex >= questions.length) {
              gameState.gameWon = true
              setGameEnded(true)
            }
          } else {
            gameState.lives--
            soundsRef.current.negative.currentTime = 0
            soundsRef.current.negative.play()
            if (gameState.lives <= 0) {
              gameState.gameOver = true
              setGameEnded(true)
            }
          }
          return false
        }
        return true
      })
    })

    if (correctAnswerHit) {
      initializeEnemies()
      gameState.bullets = []
    }

    if (gameState.enemies.some(enemy => enemy.y + 30 > CANVAS_HEIGHT - PLAYER_HEIGHT - 10)) {
      gameState.lives--
      soundsRef.current.negative.currentTime = 0
      soundsRef.current.negative.play()
      if (gameState.lives <= 0) {
        gameState.gameOver = true
        setGameEnded(true)
      } else {
        initializeEnemies()
      }
    }
  }, [initializeEnemies, questions])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { score, lives, currentQuestionIndex, playerX, bullets, enemies, gameOver, gameWon } = gameStateRef.current

    ctx.drawImage(imagesRef.current.background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ctx.fillStyle = '#fff'
    ctx.font = '16px "Press Start 2P", cursive'
    ctx.fillText(`SCORE: ${score}`, 80, 30)
    ctx.fillText(`LIVES: ${lives}`, CANVAS_WIDTH - 150, 30)

    if (currentQuestionIndex < questions.length) {
      ctx.textAlign = 'center'
      ctx.fillText(questions[currentQuestionIndex].question, CANVAS_WIDTH / 2, 60)
    }

    ctx.drawImage(imagesRef.current.player, playerX, CANVAS_HEIGHT - PLAYER_HEIGHT - 10, PLAYER_WIDTH, PLAYER_HEIGHT)

    bullets.forEach(bullet => {
      ctx.fillStyle = '#f00'
      ctx.fillRect(bullet.x - 2, bullet.y, 4, 10)
    })

    enemies.forEach((enemy, index) => {
      const enemyImage = imagesRef.current[`enemy${(index % 3) + 1}` as keyof typeof imagesRef.current]
      ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, 30)
      ctx.fillStyle = '#fff'
      ctx.font = '16px "Press Start 2P", cursive'
      ctx.textAlign = 'center'
      ctx.fillText(enemy.text, enemy.x + enemy.width / 2, enemy.y + 45)
    })

    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = '#fff'
      ctx.font = '40px "Press Start 2P", cursive'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
    } else if (gameWon) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = '#fff'
      ctx.font = '40px "Press Start 2P", cursive'
      ctx.textAlign = 'center'
      ctx.fillText('YOU WON!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
    }
  }, [questions])

  const gameLoop = useCallback(() => {
    if (gameStateRef.current.gameOver || gameStateRef.current.gameWon) {
      cancelAnimationFrame(requestRef.current!)
      return
    }
    updateGameState()
    draw()
    requestRef.current = requestAnimationFrame(gameLoop)
  }, [updateGameState, draw])

  useEffect(() => {
    if (!gameStarted) return
    initializeEnemies()
    requestRef.current = requestAnimationFrame(gameLoop)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(requestRef.current!)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [gameStarted, initializeEnemies, gameLoop, handleKeyDown])

  const startGame = useCallback(() => {
    gameStateRef.current = {
      score: 0,
      lives: 3,
      currentQuestionIndex: 0,
      playerX: CANVAS_WIDTH / 2,
      bullets: [],
      enemies: [],
      gameOver: false,
      gameWon: false,
    }
    setGameStarted(true)
    setGameEnded(false)
    initializeEnemies()
    requestRef.current = requestAnimationFrame(gameLoop)
  }, [initializeEnemies, gameLoop])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
      <h1 className="text-3xl font-bold text-white mb-4 font-['Press_Start_2P']">QUIZ INVADERS</h1>
      {!gameStarted || gameEnded ? (
        <button
          className="bg-white text-black font-bold py-2 px-4 rounded font-['Press_Start_2P']"
          onClick={startGame}
        >
          {gameEnded ? 'Play Again' : 'Start Game'}
        </button>
      ) : (
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-white bg-black"
          style={{ width: '100%', maxWidth: CANVAS_WIDTH, height: 'auto' }}
        />
      )}
      <Button onClick={onClose} variant="destructive" className="mt-4">
        Back to Games
      </Button>
    </div>
  )
}
