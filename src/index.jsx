
import React from "react";
import { createRoot } from "react-dom/client";
import AuthWrapper from "./AuthWrapper";
import "./App.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthWrapper />
  </React.StrictMode>
);
