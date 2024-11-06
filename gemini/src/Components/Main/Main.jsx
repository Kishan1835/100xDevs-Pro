import { useContext } from "react";
import { assets } from "../../assets/assets";
import "./Main.css";
import { Context } from "../../context/context";

// GEMINI API => AIzaSyB5U0bcmtVGh4QZAyX6ktJVAMioQC_mqdA
const Main = () => {
  const { onSet, recentPrompt, showResult, loading, resultData, setInput, input } = useContext(Context)


  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icoons} alt="" />
      </div>
      <div className="main-container">
        <div className="greet">
          <p>
            <span>Hello, Dev.</span>
          </p>
          <p>How can I help you today?</p>
        </div>
        <div className="cards">
          <div className="card">
            <p>Suggest beautifly places to see on an upcoming road trip</p>
            <img src={assets.compass_icon} alt="" />
          </div>
          <div className="card">
            <p>Briefly summarize this concept: urban planning </p>
            <img src={assets.bulb_icon} alt="" />
          </div>
          <div className="card">
            <p>Barinstorm team binding activities for our work retreat</p>
            <img src={assets.message_icon} alt="" />
          </div>
          <div className="card">
            <p>Improve the readability of the following code</p>
            <img src={assets.code_icon} alt="" />
          </div>
        </div>

        <div className="main-bottom">
          <div className="search-box">
            <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Enter a prompt here" />
            <img src={assets.gallery_icon} alt="" />
            <img src={assets.mic_icon} alt="" />
            <img onClick={() => onSet()} src={assets.send_icon} alt="" />
          </div>
          <div className="bottom-info">
            Gemini may display inaccurate info,including about people
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
