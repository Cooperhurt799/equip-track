import React, { useState } from "react";
import App from "./App";
import "./AuthWrapper.css";

function AuthWrapper() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('authUser');
    const savedTimestamp = localStorage.getItem('authTimestamp');

    if (savedUser && savedTimestamp) {
      const timeElapsed = (Date.now() - parseInt(savedTimestamp)) / 1000 / 60; // Convert to minutes
      if (timeElapsed < 20) {
        return JSON.parse(savedUser);
      } else {
        localStorage.removeItem('authUser');
        localStorage.removeItem('authTimestamp');
      }
    }
    return null;
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validCredentials = {
    'Username2025': 'Password123'
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (validCredentials[email] === password) {
      const userObj = { username: email };
      setUser(userObj);
      localStorage.setItem('authUser', JSON.stringify(userObj));
      localStorage.setItem('authTimestamp', Date.now().toString());
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setEmail("");
    setPassword("");
    localStorage.removeItem('authUser');
    localStorage.removeItem('authTimestamp');
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setLoading(false);
                }}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                  setLoading(false);
                }}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
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