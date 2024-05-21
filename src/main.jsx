// src/main.jsx (ou src/index.js)
import React from "react";
import ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import WildlensMain from "./App.jsx";
import Infos from "./Info.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<WildlensMain />} />
        <Route path="/infos/:speciesName" element={<Infos />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
