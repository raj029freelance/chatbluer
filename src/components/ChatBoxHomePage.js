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
  faComment,
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";

import buttonBg from "../assets/button.webp";
import ChatBox from "./ChatBox";

const ChatBoxHomePage = () => {
  const [chatBox, setChatBox] = useState(false);

  return (
    <div>
      {/* Loop video plays indefinitely in background */}

      <div className="footer" style={{ zIndex: 10 }}>
        <Row className="footer-row">
          <Col span={2}></Col>
          <Col span={8} className="icons-container"></Col>
          <Col span={2} align="end">
            <ChatBox isVisible={chatBox} />
            <button
              className={`mic-button`}
              onClick={() => setChatBox(!chatBox)}
              style={{ padding: "0.9em" }}
            >
              <FontAwesomeIcon
                icon={faComment}
                className="mic-icon"
                style={{ color: "#581b98" }}
              />
            </button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ChatBoxHomePage;
