"use client"

import { useRouter } from "next/navigation"
import QuestionPage from "../../components/QuestionPage"

export default function Question3() {
  const router = useRouter()

  const handleAnswer = (answer: string) => {
    localStorage.setItem("gift", answer)
  }

  return (
    <QuestionPage
      question="What kind of gift would you prefer?"
      options={[
        { text: "Flowers and chocolates", value: "classic" },
        { text: "Personalized photo album", value: "album" },
        { text: "Surprise experience or adventure", value: "experience" },
        { text: "Handmade craft or letter", value: "handmade" },
      ]}
      nextPage="/results"
      onAnswer={handleAnswer}
    />
  )
}

