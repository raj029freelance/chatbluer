import "./App.css";
import Home from "./components/Home";
import "react-simple-flex-grid/lib/main.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatBoxHomePage from "./components/ChatBoxHomePage";
import FullScreenChatBox from "./components/FullScreenChatBox";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbox" element={<ChatBoxHomePage />} />
          <Route path="/chat" element={<FullScreenChatBox />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
