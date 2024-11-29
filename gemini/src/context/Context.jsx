import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext()

const ContextProvider = (props) => {
    const [input, setInput] = useState("")
    const [recentPrompt, setRecntPrompt] = useState("")
    const [prevPrompt, setPrevPrompt] = useState([])
    const [showResult, setShowResult] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resultData, setResultData] = useState("")

    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData(prev => prev + nextWord)
        }, 75 * index);
    }

    const newChat = () => {
        setLoading(false)
        setShowResult(false)
    }

    const onSet = async (prompt) => {
        try {
            setResultData("")
            setLoading(true)
            setShowResult(true)
            let response;

            if (prompt !== undefined) {
                response = await run(prompt)
                setRecntPrompt(prompt)
            } else {
                setPrevPrompt(prev => [...prev, input])
                setRecntPrompt(input)
                response = await run(input)
            }

            if (!response) {
                throw new Error('No response received from API')
            }

            let responseArray = response.split("**")
            let newResponse = "";
            for (let i = 0; i < responseArray.length; i++) {
                if (i === 0 || i % 2 !== 1) {
                    newResponse += responseArray[i];
                }
                else {
                    newResponse += "<b>" + responseArray[i] + "</b>";  // Fixed closing tag from <b> to </b>
                }
            }
            let newResponse2 = newResponse.split("*").join("<br>")
            let newResponseArray = newResponse2.split(" ")
            for (let i = 0; i < newResponseArray.length; i++) {
                const nextWord = newResponseArray[i]
                delayPara(i, nextWord + " ")
            }
        } catch (error) {
            console.error('Error processing response:', error)
            setResultData("Sorry, there was an error processing your request.")
        } finally {
            setLoading(false)
            setInput("")
        }
    }


    const contextValue = {
        prevPrompt,
        setPrevPrompt,
        onSet,
        setRecntPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat


    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )

}

export default ContextProvider