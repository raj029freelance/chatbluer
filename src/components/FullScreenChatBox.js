import { faMicrophone, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Col } from "react-simple-flex-grid";
import "./FullScreenChatBox.css";
import React, { useState, useRef, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import buttonBg from "../assets/button.webp";

const FullScreenChatBox = () => {
  const loopVideoRef = useRef(null);
  const responseVideoRef = useRef(null);
  const [isOverlayVisible, setOverlayVisible] = useState(true);

  const [videoInQueue, setVideoInQueue] = useState(undefined);
  const [videoName, setVideoName] = useState("welcome.mp4");
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState([]);

  const [shouldUnmuteOnEnd, setShouldUnmuteOnEnd] = useState(true);
  const [isResponseVideoVisible, setResponseVideoVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (isOverlayVisible) return;
    // loopVideoRef.current.play();
    responseVideoRef.current.play();
    setMessages((messages) => [
      ...messages,
      {
        className: "messages__item messages__item--visitor-fullscreen",
        message: "Hey there, How may I help you ?",
      },
    ]);
  }, [isOverlayVisible]);

  // Sends the message to the server
  const sendDialogToServer = async (message) => {
    if (message.trim() !== "") {
      setLoading(true);
      setDisabled(true);
      SpeechRecognition.stopListening();
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
    const className = "messages__item messages__item--operator-fullscreen";
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

  return (
    <>
      {isOverlayVisible && (
        <div className="overlay">
          <img
            onClick={() => setOverlayVisible(false)}
            height="100px"
            style={{
              cursor: "pointer",
            }}
            src={buttonBg}
            alt="button"
          />
        </div>
      )}
      <Row>
        <Col md={8} xs={12} className="video-container">
          {/* Loop video plays indefinitely in background */}
          <video
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
              startListening();
              setLoading(false);
              setVideoName(videoInQueue);
              setVideoInQueue(undefined);
              setResponseVideoVisible(true);
              responseVideoRef.current.load();
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
              startListening();
              // To reset the loop video to 0th second
              setDisabled(false);
              loopVideoRef.current.currentTime = 0;
              loopVideoRef.current.play();
              //   startListening();

              setVideoName(undefined);
              setResponseVideoVisible(false);

              // Triggered only once after clicking the start button
              if (shouldUnmuteOnEnd) {
                // startListening();
                setShouldUnmuteOnEnd(false);
              }
            }}
            style={{ display: isResponseVideoVisible ? "block" : "none" }}
          >
            <source src={`/videos/${videoName}`} type="video/mp4" />
          </video>
        </Col>
        <Col md={4} xs={12} className="right-container">
          <div class="chatbox-fullscreen">
            <div class="chatbox__support-fullscreen">
              <div class="chatbox__messages" style={{ marginBottom: 50 }}>
                <div>
                  {messages.map((message) => {
                    return (
                      <div class={message.className}>{message.message}</div>
                    );
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
              {/* <div class="chatbox__footer-fullscreen">
                <input
                  type="text"
                  placeholder="Write a message..."
                  onKeyDown={handleKeyDown}
                  onChange={handleChange}
                  value={textInput}
                  disabled={isDisabled}
                />
                <FontAwesomeIcon
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
                  style={{ color: listening ? "red" : "black" }}
                  onTouchStart={!isDisabled ? startListening : () => {}}
                  onMouseDown={!isDisabled ? startListening : () => {}}
                  onTouchEnd={
                    !isDisabled ? SpeechRecognition.stopListening : () => {}
                  }
                  onMouseUp={
                    !isDisabled ? SpeechRecognition.stopListening : () => {}
                  }
                />
              </div>  */}
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default FullScreenChatBox;
