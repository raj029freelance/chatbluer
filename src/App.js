import "./App.css";
import Home from "./components/Home";
import "react-simple-flex-grid/lib/main.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatBoxHomePage from "./components/ChatBoxHomePage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbox" element={<ChatBoxHomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
