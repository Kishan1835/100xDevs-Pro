"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import confetti from "canvas-confetti"

// You'll need to set up a Google Cloud project and get the necessary credentials
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

export default function Results() {
  const [activity, setActivity] = useState("")
  const [dinner, setDinner] = useState("")
  const [gift, setGift] = useState("")
  const [isCalendarAdded, setIsCalendarAdded] = useState(false)

  useEffect(() => {
    setActivity(localStorage.getItem("activity") || "")
    setDinner(localStorage.getItem("dinner") || "")
    setGift(localStorage.getItem("gift") || "")

    // Launch confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Load the Google API client library
    const script = document.createElement("script")
    script.src = "https://apis.google.com/js/api.js"
    script.onload = initializeGoogleApi
    document.body.appendChild(script)
  }, [])

  const initializeGoogleApi = () => {
    window.gapi.load("client:auth2", () => {
      window.gapi.client
        .init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          scope: "https://www.googleapis.com/auth/calendar.events",
        })
        .then(() => {
          console.log("Google API Initialized");
        })
        .catch((error: unknown) => {
          console.error("Error initializing Google API:", error);
        });
    });
  }

  const getActivityText = () => {
    switch (activity) {
      case "park":
        return "a romantic walk in the park"
      case "museum":
        return "visiting a museum or art gallery"
      case "spa":
        return "enjoying a couple's spa day"
      case "cooking":
        return "taking a cooking class together"
      default:
        return "spending time together"
    }
  }

  const getDinnerText = () => {
    switch (dinner) {
      case "fancy":
        return "a fancy restaurant"
      case "cafe":
        return "a cozy cafe"
      case "picnic":
        return "having a picnic under the stars"
      case "home":
        return "enjoying a home-cooked meal"
      default:
        return "having dinner"
    }
  }

  const getGiftText = () => {
    switch (gift) {
      case "classic":
        return "flowers and chocolates"
      case "album":
        return "a personalized photo album"
      case "experience":
        return "a surprise experience or adventure"
      case "handmade":
        return "a handmade craft or letter"
      default:
        return "a special gift"
    }
  }

  const addToGoogleCalendar = () => {
    window.gapi.auth2
      .getAuthInstance()
      .signIn()
      .then((_user: unknown) => {
        console.log("User signed in:", _user);
        return window.gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: {
            summary: "Valentine's Day Date",
            description: `Our perfect Valentine's Day includes ${getActivityText()}, ${getDinnerText()}, and exchanging ${getGiftText()}.`,
            start: {
              dateTime: "2024-02-14T18:00:00",
              timeZone: "America/New_York",
            },
            end: {
              dateTime: "2024-02-14T22:00:00",
              timeZone: "America/New_York",
            },
          },
        });
      })
      .then((response: { result: unknown }) => {
        setIsCalendarAdded(true);
        console.log("Event added to calendar:", response.result);
      })
      .catch((error: unknown) => {
        console.error("Error adding event to calendar:", error);
      });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-4xl font-bold mb-6 text-pink-600">Our Perfect Valentine's Day</h1>
      <Heart className="w-20 h-20 text-red-500 animate-pulse mb-6" />
      <div className="bg-white rounded-lg p-8 shadow-lg max-w-md">
        <p className="text-xl mb-4">Based on your choices, our perfect Valentine's Day will include:</p>
        <ul className="list-disc list-inside text-left space-y-2 mb-6">
          <li>{getActivityText()}</li>
          <li>{getDinnerText()}</li>
          <li>Exchanging {getGiftText()}</li>
        </ul>
        <p className="text-lg font-semibold mb-6">I can't wait to spend this special day with you! ❤️</p>
        {!isCalendarAdded ? (
          <button
            onClick={addToGoogleCalendar}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 mb-4"
          >
            Add to Google Calendar
          </button>
        ) : (
          <p className="text-green-600 font-semibold mb-4">Added to Google Calendar!</p>
        )}
        <Link
          href="/"
          className="block bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Plan Another Date
        </Link>
      </div>
    </div>
  )
}

