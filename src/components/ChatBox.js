import React, { useState, useRef, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const ChatBox = ({ isVisible }) => {
  const loopVideoRef = useRef(null);
  const responseVideoRef = useRef(null);

  const [videoInQueue, setVideoInQueue] = useState(undefined);
  const [videoName, setVideoName] = useState("welcome.mp4");
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState([
    {
      className: "messages__item messages__item--visitor",
      message: "Hey there, How may I help you ?",
    },
  ]);

  const [shouldUnmuteOnEnd, setShouldUnmuteOnEnd] = useState(true);
  const [isResponseVideoVisible, setResponseVideoVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    if (!isVisible) return;
    // loopVideoRef.current.play();
    responseVideoRef.current.play();
    loopVideoRef.current.play();
  }, [isVisible]);

  // Sends the message to the server
  const sendDialogToServer = async (message) => {
    if (message.trim() !== "") {
      setLoading(true);
      // console.log("Captured text : ", message);
      const res = await axios.post(
        "https://vidchatapi.herokuapp.com/text-input",
        {
          message: message,
        }
      );
      const responseVideoName =
        res.data.data[0].queryResult.fulfillmentText.split(";")[0] + ".mp4";
      const responseTextFromServer =
        res.data.data[0].queryResult.fulfillmentText.split(";")[1];
      setResponseText(responseTextFromServer);
      // console.log("Video to be played : ", responseVideoName);
      setVideoInQueue(responseVideoName);
    }
  };

  const commands = [
    {
      command: "*",
      callback: (message) => {
        handleEnter(message);
      },
    },
  ];
  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({
    commands,
  });

  // Enables microphone
  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  // Toggles microphone
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      startListening();
    }
  };

  const handleChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleEnter = (customMessage = "") => {
    const message = customMessage !== "" ? customMessage : textInput;
    console.log(message);
    const className = "messages__item messages__item--operator";
    if (message.trim() !== "") {
      setMessages((messages) => [
        ...messages,
        {
          message,
          className,
        },
      ]);
      sendDialogToServer(message);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleEnter();
      setTextInput("");
    }
  };

  // Checks browser compatibility
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  if (isVisible) {
    return (
      <>
        <div class="chatbox">
          <div class="chatbox__support">
            <div class="chatbox__header">
              <div class="chatbox__image--header">
                <img src="../assets/image.png" alt="" />
              </div>
              <div class="chatbox__content--header"></div>
            </div>
            <div class="chatbox__messages">
              <div style={{ marginTop: 300 }}>
                <video
                  style={{
                    top: 0,
                    left: 0,
                    width: "100%",
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    position: "absolute",
                  }}
                  ref={loopVideoRef}
                  muted
                  onEnded={() => {
                    //If no video is in queue we loop the video again from 0th second
                    if (!videoInQueue) {
                      // loopVideoRef.current.currentTime = 0;
                      loopVideoRef.current.play();
                      return;
                    }

                    //If there is a video in queue we set that to be played and make the response visible
                    const className = "messages__item messages__item--visitor";
                    setMessages((messages) => [
                      ...messages,
                      {
                        message: responseText,
                        className,
                      },
                    ]);
                    setLoading(false);
                    setVideoName(videoInQueue);
                    setVideoInQueue(undefined);
                    responseVideoRef.current.load();
                    setResponseVideoVisible(true);
                    SpeechRecognition.stopListening();
                    responseVideoRef.current.play();
                  }}
                >
                  <source src="/videos/loop.mp4" type="video/mp4" />
                </video>

                {/* Loading the response video, initially the video name is welcome.mp4 */}
                <video
                  ref={responseVideoRef}
                  onEnded={() => {
                    // To reset the loop video to 0th second
                    loopVideoRef.current.currentTime = 0;
                    loopVideoRef.current.play();
                    // startListening();

                    setVideoName(undefined);
                    setResponseVideoVisible(false);

                    // Triggered only once after clicking the start button
                    if (shouldUnmuteOnEnd) {
                      // startListening();
                      setShouldUnmuteOnEnd(false);
                    }
                  }}
                  style={{
                    top: 0,
                    left: 0,
                    width: "100%",
                    position: "absolute",
                    display: isResponseVideoVisible ? "block" : "none",
                  }}
                >
                  <source src={`/videos/${videoName}`} type="video/mp4" />
                </video>

                {messages.map((message) => {
                  return <div class={message.className}>{message.message}</div>;
                })}
                {loading ? (
                  <div class="messages__item messages__item--typing">
                    <span class="messages__dot"></span>
                    <span class="messages__dot"></span>
                    <span class="messages__dot"></span>
                  </div>
                ) : null}
              </div>
            </div>
            <div class="chatbox__footer">
              <input
                type="text"
                disabled={loading}
                value={textInput}
                placeholder="Write a message..."
                onKeyDown={handleKeyDown}
                onChange={handleChange}
              />
              <FontAwesomeIcon
                style={{ color: "#fff", cursor: "pointer", marginLeft: 15 }}
                icon={faPaperPlane}
                onClick={() => {
                  if (textInput.trim() !== "") {
                    handleEnter();
                    setTextInput("");
                  }
                }}
              />
              <FontAwesomeIcon
                icon={faMicrophone}
                onClick={toggleListening}
                style={{
                  cursor: "pointer",
                  color: "#fff",
                  marginLeft: 10,
                  padding: "10px",
                  backgroundColor: listening ? "#b000e694" : "transparent",
                  borderRadius: "20px",
                }}
                onTouchStart={!loading ? startListening : () => {}}
                onMouseDown={!loading ? startListening : () => {}}
                onTouchEnd={
                  !loading ? SpeechRecognition.stopListening : () => {}
                }
                onMouseUp={
                  !loading ? SpeechRecognition.stopListening : () => {}
                }
              />

              {/* <img src="../assets/icons/attachment.svg" alt="" /> */}
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return null;
  }
};
export default ChatBox;
