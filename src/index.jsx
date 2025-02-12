import React from "react";
import ReactDOM from "react-dom";
import App from "./App";  // Now we import App directly
import "./App.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);