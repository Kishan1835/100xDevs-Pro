"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import LoveBackground from "./components/LoveBackground"
import confetti from "canvas-confetti"

export default function Home() {
  const [answer, setAnswer] = useState<string | null>(null)

  useEffect(() => {
    if (answer === "yes") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [answer])

  const handleAnswer = (response: string) => {
    setAnswer(response)
    if (response === "yes") {
      localStorage.setItem("valentineAnswer", "yes")
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-24 text-center overflow-hidden">
      <LoveBackground />
      <div className="relative z-10 bg-white bg-opacity-80 p-8 rounded-lg shadow-xl backdrop-blur-sm">
        <h1 className="text-4xl font-bold mb-6 text-pink-600">Will you be my Valentine?</h1>
        <Heart className="w-20 h-20 text-red-500 animate-pulse mb-6 mx-auto" />
        {answer === null ? (
          <div className="space-y-4">
            <button
              onClick={() => handleAnswer("yes")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg mr-4"
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer("no")}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              No
            </button>
          </div>
        ) : answer === "yes" ? (
          <div className="space-y-4">
            <p className="text-2xl text-green-600 mb-4 animate-bounce">Yay! I'm so happy! ❤️</p>
            <Link
              href="/questions/1"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              Let's Plan Our Date
            </Link>
          </div>
        ) : (
          <p className="text-2xl text-red-600 mb-4 animate-bounce">Oh no! Maybe next time? 😢</p>
        )}
      </div>
    </main>
  )
}

