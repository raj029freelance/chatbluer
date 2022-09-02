import React, { useState, useRef, useEffect } from "react";
import { Row, Col } from "react-simple-flex-grid";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartArea,
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";

import buttonBg from "../assets/button.webp";
import ChatBox from "./ChatBox";

const Home = () => {
  const micRef = useRef(null);
  const loopVideoRef = useRef(null);
  const responseVideoRef = useRef(null);

  const [videoInQueue, setVideoInQueue] = useState(undefined);
  const [videoName, setVideoName] = useState("welcome.mp4");
  const [textInput, setTextInput] = useState("");

  const [shouldUnmuteOnEnd, setShouldUnmuteOnEnd] = useState(true);
  const [isResponseVideoVisible, setResponseVideoVisible] = useState(true);
  const [isOverlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (isOverlayVisible) return;
    // loopVideoRef.current.play();
    responseVideoRef.current.play();
  }, [isOverlayVisible]);

  // Sends the message to the server
  const sendDialogToServer = async (message) => {
    if (message.trim() !== "") {
      // console.log("Captured text : ", message);
      const res = await axios.post(
        "https://vidchatapi.herokuapp.com/text-input",
        {
          message: message,
        }
      );
      const responseVideoName =
        res.data.data[0].queryResult.fulfillmentText.split(";")[0] + ".mp4";
      // console.log("Video to be played : ", responseVideoName);
      setVideoInQueue(responseVideoName);
    }
  };

  const commands = [
    {
      command: "*",
      callback: (message) => sendDialogToServer(message),
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

  // Checks browser compatibility
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      {/* Loop video plays indefinitely in background */}
      <video
        className="video"
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
        className="video"
        ref={responseVideoRef}
        onEnded={() => {
          // To reset the loop video to 0th second
          loopVideoRef.current.currentTime = 0;
          loopVideoRef.current.play();
          startListening();

          setVideoName(undefined);
          setResponseVideoVisible(false);

          // Triggered only once after clicking the start button
          if (shouldUnmuteOnEnd) {
            startListening();
            setShouldUnmuteOnEnd(false);
          }
        }}
        style={{ display: isResponseVideoVisible ? "block" : "none" }}
      >
        <source src={`/videos/${videoName}`} type="video/mp4" />
      </video>

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

      <div className="footer" style={{ zIndex: 10 }}>
        <Row className="footer-row">
          <Col span={2}></Col>
          <Col span={6} className="icons-container"></Col>
          <Col span={4} align="end">
            <button
              className={`mic-button ${listening ? "muted-icon" : ""}`}
              ref={micRef}
              onClick={toggleListening}
            >
              {listening ? (
                <FontAwesomeIcon icon={faMicrophone} className="mic-icon" />
              ) : (
                <FontAwesomeIcon
                  icon={faMicrophoneSlash}
                  className="mic-icon"
                />
              )}
            </button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
