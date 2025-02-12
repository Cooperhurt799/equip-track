// index.js
import React from "react";
import ReactDOM from "react-dom";
import AuthWrapper from "./AuthWrapper"; // Import the AuthWrapper component
import "./App.css";

ReactDOM.render(
	<React.StrictMode>
		<AuthWrapper />
	</React.StrictMode>,
	document.getElementById("root")
);