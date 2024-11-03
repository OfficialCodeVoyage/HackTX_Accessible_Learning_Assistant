'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState, useCallback } from 'react'

type Question = {
  question: string
  options: string[]
  correctAnswer: string
}

const questions: Question[] = [
  {
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correctAnswer: "Paris"
  },
  {
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Mars", "Mercury", "Earth"],
    correctAnswer: "Mercury"
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4"
  }
]

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 60
const PLAYER_SPEED = 5
const GRAVITY = 0.4
const JUMP_FORCE = 12
const OBSTACLE_WIDTH = 10
const OBSTACLE_HEIGHT = 30
const OBSTACLE_SPEED = 3

export function MarioRun({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    currentQuestionIndex: 0,
    playerX: 50,
    playerY: CANVAS_HEIGHT - PLAYER_HEIGHT,
    playerVelocityY: 0,
    isJumping: false,
    obstacles: [] as { x: number; y: number; text: string; enemyType: number }[],
    gameOver: false,
    gameWon: false,
  })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const requestRef = useRef<number>()
  const imagesRef = useRef<{
    background: HTMLImageElement
    player: HTMLImageElement
    enemy1: HTMLImageElement
    enemy2: HTMLImageElement
    enemy3: HTMLImageElement
  }>({
    background: new window.Image(),
    player: new window.Image(),
    enemy1: new window.Image(),
    enemy2: new window.Image(),
    enemy3: new window.Image(),
  })
  const soundsRef = useRef({
    jump: new Audio('/sounds/jump.wav'),
    collect: new Audio('/sounds/collect.wav'),
    hit: new Audio('/sounds/hit.wav'),
    gameOver: new Audio('/sounds/game-over.wav'),
    gameWon: new Audio('/sounds/game-won.wav'),
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    let loadedImages = 0
    const totalImages = 5

    const handleImageLoad = () => {
      loadedImages++
      if (loadedImages === totalImages) {
        setImagesLoaded(true)
      }
    }

    const images = [
      { img: imagesRef.current.background, src: '/images/space.png' },
      { img: imagesRef.current.player, src: '/images/mario.png' },
      { img: imagesRef.current.enemy1, src: '/images/ene1.png' },
      { img: imagesRef.current.enemy2, src: '/images/ene2.png' },
      { img: imagesRef.current.enemy3, src: '/images/ene3.png' }
    ]

    images.forEach(({ img, src }) => {
      img.onload = handleImageLoad
      img.src = src
    })

    Object.values(soundsRef.current).forEach(sound => {
      sound.volume = 0.1
    })

    return () => {
      images.forEach(({ img }) => {
        img.onload = null
      })
    }
  }, [])

  const initializeObstacles = useCallback(() => {
    const { currentQuestionIndex } = gameStateRef.current
    if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex]
      gameStateRef.current.obstacles = currentQuestion.options.map((option, index) => ({
        x: CANVAS_WIDTH + index * 250,
        y: CANVAS_HEIGHT - OBSTACLE_HEIGHT - 30,
        text: option,
        enemyType: (index % 3) + 1
      }))
    } else {
      gameStateRef.current.gameWon = true
      setGameEnded(true)
      soundsRef.current.gameWon.play()
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !gameStateRef.current.isJumping) {
      gameStateRef.current.playerVelocityY = -JUMP_FORCE
      gameStateRef.current.isJumping = true
      soundsRef.current.jump.currentTime = 0
      soundsRef.current.jump.play()
    }
  }, [])

  const updateGameState = useCallback(() => {
    const gameState = gameStateRef.current
    gameState.playerVelocityY += GRAVITY
    gameState.playerY += gameState.playerVelocityY

    if (gameState.playerY > CANVAS_HEIGHT - PLAYER_HEIGHT) {
      gameState.playerY = CANVAS_HEIGHT - PLAYER_HEIGHT
      gameState.playerVelocityY = 0
      gameState.isJumping = false
    }

    gameState.obstacles = gameState.obstacles.map(obstacle => ({
      ...obstacle,
      x: obstacle.x - OBSTACLE_SPEED,
    }))

    let correctAnswerHit = false
    gameState.obstacles = gameState.obstacles.filter(obstacle => {
      if (
        gameState.playerX < obstacle.x + OBSTACLE_WIDTH &&
        gameState.playerX + PLAYER_WIDTH > obstacle.x &&
        gameState.playerY + PLAYER_HEIGHT > obstacle.y &&
        gameState.playerY < obstacle.y + OBSTACLE_HEIGHT
      ) {
        if (obstacle.text === questions[gameState.currentQuestionIndex].correctAnswer) {
          gameState.score += 100
          soundsRef.current.collect.currentTime = 0
          soundsRef.current.collect.play()
          correctAnswerHit = true
        } else {
          gameState.lives--
          soundsRef.current.hit.currentTime = 0
          soundsRef.current.hit.play()
          if (gameState.lives <= 0) {
            gameState.gameOver = true
            setGameEnded(true)
            soundsRef.current.gameOver.play()
          }
        }
        return false
      }
      return obstacle.x + OBSTACLE_WIDTH > 0
    })

    if (correctAnswerHit) {
      gameState.currentQuestionIndex++
      if (gameState.currentQuestionIndex >= questions.length) {
        gameState.gameWon = true
        setGameEnded(true)
        soundsRef.current.gameWon.play()
      } else {
        initializeObstacles()
      }
    } else if (gameState.obstacles.length === 0) {
      initializeObstacles()
    }
  }, [initializeObstacles])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !imagesLoaded) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { score, lives, currentQuestionIndex, playerX, playerY, obstacles, gameOver, gameWon } = gameStateRef.current

    ctx.drawImage(imagesRef.current.background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.drawImage(imagesRef.current.player, playerX, playerY, PLAYER_WIDTH, PLAYER_HEIGHT)

    obstacles.forEach(obstacle => {
      const enemyImage = imagesRef.current[`enemy${obstacle.enemyType}` as keyof typeof imagesRef.current]
      ctx.drawImage(enemyImage, obstacle.x, obstacle.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT)
      ctx.fillStyle = '#fff'
      ctx.font = '12px "Press Start 2P", cursive'
      ctx.textAlign = 'center'
      ctx.fillText(obstacle.text, obstacle.x + OBSTACLE_WIDTH / 2, obstacle.y + OBSTACLE_HEIGHT + 20)
    })

    ctx.fillStyle = '#fff'
    ctx.font = '16px "Press Start 2P", cursive'
    ctx.textAlign = 'left'
    ctx.fillText(`SCORE: ${score}`, 10, 30)
    ctx.fillText(`LIVES: ${lives}`, CANVAS_WIDTH - 150, 30)

    if (currentQuestionIndex < questions.length) {
      ctx.textAlign = 'center'
      ctx.fillText(questions[currentQuestionIndex].question, CANVAS_WIDTH / 2, 70)
    }

    if (gameOver || gameWon) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = '#fff'
      ctx.font = '40px "Press Start 2P", cursive'
      ctx.textAlign = 'center'
      ctx.fillText(gameOver ? 'GAME OVER' : 'YOU WON!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
    }
  }, [imagesLoaded])

  const gameLoop = useCallback(() => {
    updateGameState()
    draw()
    if (!gameStateRef.current.gameOver && !gameStateRef.current.gameWon) {
      requestRef.current = requestAnimationFrame(gameLoop)
    }
  }, [draw, updateGameState])

  const startGame = () => {
    gameStateRef.current = {
      score: 0,
      lives: 3,
      currentQuestionIndex: 0,
      playerX: 50,
      playerY: CANVAS_HEIGHT - PLAYER_HEIGHT,
      playerVelocityY: 0,
      isJumping: false,
      obstacles: [],
      gameOver: false,
      gameWon: false,
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
    }
    setGameStarted(false)
    setTimeout(() => setGameStarted(true), 0)
    setGameEnded(false)
  }

  useEffect(() => {
    if (gameStarted && imagesLoaded) {
      window.addEventListener('keydown', handleKeyDown)
      initializeObstacles()
      requestRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameStarted, imagesLoaded, gameLoop, handleKeyDown, initializeObstacles])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
      <h1 className="text-3xl font-bold text-white mb-4 font-['Press_Start_2P']">QUIZ RUNNER</h1>
      {!gameStarted || gameEnded ? (
        <button
          className="bg-white text-black font-bold py-2 px-4 rounded font-['Press_Start_2P']"
          onClick={startGame}
          disabled={!imagesLoaded}
        >
          {!imagesLoaded ? 'Loading...' : gameEnded ? 'Play Again' : 'Start Game'}
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
