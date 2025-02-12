// AuthWrapper.jsx
import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import App from "./App"; // Import your main app component
import "./AuthWrapper.css"; // Optional: Add your styles for the auth form

function AuthWrapper() {
  // State to hold the authenticated user
  const [user, setUser] = useState(null);
  // Toggle between registration and sign in modes
  const [isRegistering, setIsRegistering] = useState(false);
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // For error messages and loading state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Listen for changes in the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (isRegistering) {
      // Registration mode
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser(userCredential.user);
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Sign in mode
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser(userCredential.user);
      } catch (err) {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="auth-wrapper">
      {!user ? (
        <div className="auth-container">
          <h2>{isRegistering ? "Register" : "Sign In"}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading
                ? "Loading..."
                : isRegistering
                ? "Register"
                : "Sign In"}
            </button>
          </form>
          <p>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
            >
              {isRegistering ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      ) : (
        <div>
          <div className="sign-out-container">
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
          <App />
        </div>
      )}
    </div>
  );
}

export default AuthWrapper;