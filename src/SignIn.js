import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom"; 
import './SignIn.css'; 

function SignIn({ onSignUpClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Create navigate object

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User successfully signed in:');
      navigate("/home"); // Redirect to Home Page on successful login
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    }
  }; 

  const handleSignUp = (type) => {
    if (typeof onSignUpClick === 'function') {
      onSignUpClick(type);
    } else {
      console.error('onSignUpClick is not defined');
    }
  };

  return (
    <div className="bg">
      <img className="imgSU" src="/dark-logo.png" alt="App Logo" />
      <div className="signIn-container">
        <h2 className="SI-header">Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="SIform-group">
            <label className='SI-label'>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="SIform-group">
            <label className='SI-label'>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="SIform-group">
            <a href="#" className="forgot-pw">
              Forgot Password?
            </a>
          </div>
          <button type="submit" className="SI-sub submit-btn">Sign In</button>
        </form>

        <div className="SIform-group">
          <p className="SI-text">Don't have an account? Register below:</p>
          {/* Customer Sign Up button */}
          <button 
            className="reg-btn" onClick={() => handleSignUp("customerSignUp")}>Customer Sign Up
          </button>
          {/* Service Provider Sign Up button */}
          <button 
            className="reg-btn" onClick={() => handleSignUp("SPSignUp")}>Service Provider Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;