"use client"

import { useRouter } from "next/navigation"
import QuestionPage from "../../components/QuestionPage"

export default function Question1() {
  const router = useRouter()

  const handleAnswer = (answer: string) => {
    // You can save the answer to local storage or a state management solution here
    localStorage.setItem("activity", answer)
  }

  return (
    <QuestionPage
      question="What kind of activity would you like to do together?"
      options={[
        { text: "Romantic walk in the park", value: "park" },
        { text: "Visit a museum or art gallery", value: "museum" },
        { text: "Couple's spa day", value: "spa" },
        { text: "Cooking class together", value: "cooking" },
      ]}
      nextPage="/questions/2"
      onAnswer={handleAnswer}
    />
  )
}

