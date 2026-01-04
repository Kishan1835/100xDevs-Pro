"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, RotateCcw, Play } from "lucide-react"
import { useTheme } from "next-themes"

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It helps improve finger dexterity and keyboard familiarity.",
  "Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovation continues to shape our future in unprecedented ways.",
  "Reading books expands our knowledge and imagination. It takes us to different worlds, introduces us to new ideas, and helps us understand diverse perspectives and cultures.",
  "The art of cooking combines creativity with science. Understanding ingredients, techniques, and flavors allows chefs to create memorable dining experiences that bring people together.",
  "Exercise and physical activity are essential for maintaining good health. Regular movement strengthens muscles, improves cardiovascular function, and enhances mental well-being.",
]

export default function TypingSpeedTest() {
  const { theme, setTheme } = useTheme()
  const [currentText, setCurrentText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isCompleted, setIsCompleted] = useState(false)
  const [errors, setErrors] = useState<number[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Initialize with a random text
    setCurrentText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && startTime && !endTime) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime)
      }, 100)
    } else if (!isActive && interval) {
      clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, startTime, endTime])

  const startTest = () => {
    setStartTime(Date.now())
    setEndTime(null)
    setIsActive(true)
    setIsCompleted(false)
    setUserInput("")
    setErrors([])
    setWpm(0)
    setAccuracy(100)
    inputRef.current?.focus()
  }

  const resetTest = () => {
    setStartTime(null)
    setEndTime(null)
    setIsActive(false)
    setIsCompleted(false)
    setUserInput("")
    setTimeElapsed(0)
    setWpm(0)
    setAccuracy(100)
    setErrors([])
    setCurrentText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
  }

  const handleInputChange = (value: string) => {
    if (!startTime) {
      setStartTime(Date.now())
      setIsActive(true)
    }

    setUserInput(value)

    // Calculate errors
    const newErrors: number[] = []
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentText[i]) {
        newErrors.push(i)
      }
    }
    setErrors(newErrors)

    // Calculate accuracy
    const correctChars = value.length - newErrors.length
    const currentAccuracy = value.length > 0 ? (correctChars / value.length) * 100 : 100
    setAccuracy(Math.round(currentAccuracy))

    // Calculate WPM
    if (startTime) {
      const timeInMinutes = (Date.now() - startTime) / 60000
      const wordsTyped = value.trim().split(" ").length
      const currentWpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0
      setWpm(currentWpm)
    }

    // Check if test is completed
    if (value === currentText) {
      setEndTime(Date.now())
      setIsActive(false)
      setIsCompleted(true)
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getCharacterClass = (index: number, char: string) => {
    if (index >= userInput.length) {
      return "text-muted-foreground"
    }
    if (errors.includes(index)) {
      return "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200"
    }
    return "text-green-600 dark:text-green-400"
  }

  const progress = (userInput.length / currentText.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Typing Speed Test</h1>
            <p className="text-muted-foreground">Test your typing speed and accuracy</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{wpm}</div>
                <p className="text-sm text-muted-foreground">WPM</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{accuracy}%</div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                <p className="text-sm text-muted-foreground">Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{errors.length}</div>
                <p className="text-sm text-muted-foreground">Errors</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </CardContent>
          </Card>

          {/* Text Display */}
          <Card>
            <CardHeader>
              <CardTitle>Text to Type</CardTitle>
              <CardDescription>Type the text below as accurately and quickly as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg leading-relaxed p-4 bg-muted/50 rounded-lg font-mono">
                {currentText.split("").map((char, index) => (
                  <span key={index} className={getCharacterClass(index, char)}>
                    {char}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Input Area */}
          <Card>
            <CardHeader>
              <CardTitle>Your Typing</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Start typing here..."
                className="w-full h-32 p-4 text-lg font-mono border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isCompleted}
              />
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button onClick={startTest} disabled={isActive}>
              <Play className="w-4 h-4 mr-2" />
              Start Test
            </Button>
            <Button onClick={resetTest} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Results */}
          {isCompleted && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">Test Completed!</CardTitle>
                <CardDescription>Here are your final results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{wpm}</div>
                    <p className="text-sm text-muted-foreground">Words per minute</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{accuracy}%</div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{formatTime(timeElapsed)}</div>
                    <p className="text-sm text-muted-foreground">Total time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{errors.length}</div>
                    <p className="text-sm text-muted-foreground">Total errors</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-center gap-2">
                  {wpm >= 40 && <Badge variant="secondary">Fast Typer!</Badge>}
                  {accuracy >= 95 && <Badge variant="secondary">High Accuracy!</Badge>}
                  {wpm >= 60 && <Badge variant="secondary">Expert Level!</Badge>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
