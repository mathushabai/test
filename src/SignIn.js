import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import './SignIn.css'; 

function SignIn({ onSignIn, onSignUpClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      onSignIn(user.email, password);
    } catch (error) {
      setError("Invalid credentials. Please try again.");
      console.error("Error signing in: ", error);
    }
  };

  return (
    <div>
      <img src="/app-logo-blue.png" alt="App Logo" />
      <div className="signIn-container">
        <h2>Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <a href="#" className="forgot-pw">
              Forgot Password?
            </a>
          </div>
          <button type="submit" className="submit-btn">Sign In</button>
        </form>

        <div className="form-group">
          <p>Don't have an account? Register below:</p>
          {/* Customer Sign Up button */}
          <button 
            className="reg-btn" onClick={() => onSignUpClick("customerSignUp")}
          >Customer Sign Up</button>

          {/* Service Provider Sign Up button */}
          <button 
            className="reg-btn" onClick={() => onSignUpClick("serviceProviderSignUp")}
          >Service Provider Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;