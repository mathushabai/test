import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase'; 
import '../css/SignUp.css'; 

const SignUp = ({ onSignUp, onSignInClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");  
  const [success, setSuccess] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);

      // Clear form and display success message
       setEmail("");
       setPassword("");
       setMobileNumber("");
        setSuccess("Account created successfully. You can now sign in.");
        setError("");
    } catch (error) {
      console.error("Error creating account: ", error);
        setError("Error creating account. Please try again.");
        setSuccess("");
    }
  };

  return (
    <div className='SP'> 
      <img className="imgSU" src="/dark-logo.png" alt="App Logo" />
      <div className="signUp-container">
      <h2 className="SU-header">Customer Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSignUp}>
        <div className="SIform-group">
          <label className='SU-label'>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="SIform-group">
          <label className='SU-label'>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="SIform-group">
          <label className='SU-label'>Mobile Number</label>
          <input
            type="tel"
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit" onClick={onSignUp} className="SU-sub submit-btn">Sign Up</button>
      </form>
        <div className="SIform-group">
          <p>Already have an account? Sign in instead:</p>
          {/* Sign In button */}
          <button className="reg-btn" onClick={onSignInClick}>Sign In</button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;