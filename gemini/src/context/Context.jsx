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



    const onSet = async (prompt) => {
        await run(input)
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
       

    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )

}

export default ContextProvider