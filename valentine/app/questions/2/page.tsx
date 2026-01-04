"use client"

import { useRouter } from "next/navigation"
import QuestionPage from "../../components/QuestionPage"

export default function Question2() {
  const router = useRouter()

  const handleAnswer = (answer: string) => {
    localStorage.setItem("dinner", answer)
  }

  return (
    <QuestionPage
      question="Where would you like to have dinner?"
      options={[
        { text: "Fancy restaurant", value: "fancy" },
        { text: "Cozy cafe", value: "cafe" },
        { text: "Picnic under the stars", value: "picnic" },
        { text: "Home-cooked meal", value: "home" },
      ]}
      nextPage="/questions/3"
      onAnswer={handleAnswer}
    />
  )
}

