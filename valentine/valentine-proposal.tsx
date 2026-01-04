"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import confetti from "canvas-confetti"
import { loveEmojis, colors } from "./utils/valentineData"

export default function ValentineProposal() {
  const [noButtonStyle, setNoButtonStyle] = useState({})
  const [yesPressed, setYesPressed] = useState(false)
  const [noCount, setNoCount] = useState(0)
  const [showGame, setShowGame] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [currentEmoji, setCurrentEmoji] = useState("")
  const [emojiPosition, setEmojiPosition] = useState({ x: 0, y: 0 })
  const [yesButtonSize, setYesButtonSize] = useState(16) // Starting size in rem

  useEffect(() => {
    if (showGame && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setShowGame(false)
      handleYesClick()
    }
  }, [showGame, timeLeft])

  useEffect(() => {
    if (showGame) {
      moveEmoji()
    }
  }, [showGame])

  const handleNoHover = () => {
    const newX = Math.random() * (window.innerWidth - 100)
    const newY = Math.random() * (window.innerHeight - 50)
    setNoButtonStyle({ position: "absolute", left: `${newX}px`, top: `${newY}px` })
    setNoCount((prevCount) => prevCount + 1)
    setYesButtonSize((prevSize) => prevSize + 0.5) // Increase size by 0.5rem each time
    if (noCount >= 5) {
      setShowGame(true)
    }
  }

  const handleYesClick = () => {
    setYesPressed(true)
    launchConfetti()
  }

  const launchConfetti = () => {
    const duration = 15 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti(
        Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }),
      )
      confetti(
        Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }),
      )
    }, 250)
  }

  const moveEmoji = () => {
    const newX = Math.random() * (window.innerWidth - 50)
    const newY = Math.random() * (window.innerHeight - 50)
    setEmojiPosition({ x: newX, y: newY })
    setCurrentEmoji(loveEmojis[Math.floor(Math.random() * loveEmojis.length)])
  }

  const handleEmojiClick = () => {
    setGameScore((prevScore) => prevScore + 1)
    moveEmoji()
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 flex flex-col items-center justify-center p-4 overflow-hidden">
      {!showGame && !yesPressed && (
        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 animate-pulse">Happy Valentine's Day!</h1>
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <Heart className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce" />
            <p className="text-2xl md:text-3xl font-semibold mb-8 text-gray-800">Will you be my Valentine?</p>
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={handleYesClick}
                style={{ fontSize: `${yesButtonSize}px` }}
                className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110`}
              >
                Yes
              </button>
              <button
                style={noButtonStyle}
                onMouseEnter={handleNoHover}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {showGame && (
        <div className="text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Catch the Love!</h2>
          <p className="text-xl text-white mb-2">Time left: {timeLeft}s</p>
          <p className="text-xl text-white mb-4">Score: {gameScore}</p>
          <div
            className="text-5xl cursor-pointer absolute transition-all duration-300 ease-in-out transform hover:scale-125"
            style={{ left: `${emojiPosition.x}px`, top: `${emojiPosition.y}px` }}
            onClick={handleEmojiClick}
          >
            {currentEmoji}
          </div>
        </div>
      )}
      {yesPressed && (
        <div className="text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4 animate-bounce">Yay! I love you! ❤️</h2>
          <p className="text-2xl text-white mb-4">
            {gameScore > 0 ? `You caught ${gameScore} love symbols!` : "Let's celebrate our love!"}
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            {colors.map((color, index) => (
              <div
                key={index}
                className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-2xl animate-pulse`}
              >
                {loveEmojis[index % loveEmojis.length]}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Floating hearts background */}
      {(showGame || yesPressed) && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {loveEmojis[Math.floor(Math.random() * loveEmojis.length)]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

