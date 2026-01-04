"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Option {
  text: string
  value: string
}

interface QuestionPageProps {
  question: string
  options: Option[]
  nextPage: string
  onAnswer: (answer: string) => void
}

export default function QuestionPage({ question, options, nextPage, onAnswer }: QuestionPageProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedOption) {
      onAnswer(selectedOption)
      router.push(nextPage)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h2 className="text-3xl font-bold mb-6 text-pink-600">{question}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {options.map((option) => (
          <div key={option.value}>
            <input
              type="radio"
              id={option.value}
              name="option"
              value={option.value}
              checked={selectedOption === option.value}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="sr-only"
            />
            <label
              htmlFor={option.value}
              className={`block w-64 p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${
                selectedOption === option.value ? "bg-pink-500 text-white" : "bg-white text-pink-600 hover:bg-pink-100"
              }`}
            >
              {option.text}
            </label>
          </div>
        ))}
        <button
          type="submit"
          disabled={!selectedOption}
          className="mt-6 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </form>
      <Link href="/" className="text-pink-600 hover:underline">
        Start Over
      </Link>
    </div>
  )
}

