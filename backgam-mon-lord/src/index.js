import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Lobby from "./Lobby";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/board" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
