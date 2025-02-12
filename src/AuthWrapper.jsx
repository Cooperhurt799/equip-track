
import React, { useState } from "react";
import App from "./App";
import "./AuthWrapper.css";

function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Add more usernames/passwords as needed
  const validCredentials = {
    'operator1': 'ranch2024',
    'operator2': 'ranch2024',
    'manager': 'admin2024'
  };

  // Convert email input to username input
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validCredentials[email] === password) {
      setUser({ username: email });
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validCredentials[email] === password) {
      setUser({ email });
      setError("");
    } else {
      setError("Invalid email or password");
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setEmail("");
    setPassword("");
  };

  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sign-out-container">
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      <App />
    </div>
  );
}

export default AuthWrapper;
