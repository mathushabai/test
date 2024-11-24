import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { db, auth } from '../firebase'; 
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import '../css/SignUp.css'; 

const SignUp = ({ onSignUp }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");  
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);

      const creationDate = formatDate(new Date());

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        username: username,
        mobileNumber: mobileNumber,
        createdAt: creationDate,
      });

      console.log("User created and data saved:", user.uid);

      // Clear form and display success message
      setEmail("");
      setPassword("");
      setPasswordRequirements("");
      setConfirmPw("");
      setUsername("");
      setMobileNumber("");
      setSuccess("Account created successfully. You can now sign in.");
      setError("");

    } catch (error) {
      console.error("Error creating account: ", error);
      setError("Error creating account. Please try again.");
      setSuccess("");
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-MY', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  };
  
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
    return (
      <div className="password-requirements">

        <p style={{ color: minLength ? "green" : "orange" }}>
          <FontAwesomeIcon icon={minLength ? faCheckCircle : faCircleExclamation} /> At least 8 characters
        </p>
        <p style={{ color: hasUpperCase ? "green" : "orange" }}>
          <FontAwesomeIcon icon={hasUpperCase ? faCheckCircle : faCircleExclamation} /> Include an uppercase letter
        </p>
        <p style={{ color: hasLowerCase ? "green" : "orange" }}>
          <FontAwesomeIcon icon={hasLowerCase ? faCheckCircle : faCircleExclamation} /> Include a lowercase letter
        </p>
        <p style={{ color: hasNumber ? "green" : "orange" }}>
          <FontAwesomeIcon icon={hasNumber ? faCheckCircle : faCircleExclamation} /> Include a number
        </p>
        <p style={{ color: hasSpecialChar ? "green" : "orange" }}>
          <FontAwesomeIcon icon={hasSpecialChar ? faCheckCircle : faCircleExclamation} /> Include a special character
        </p>
      </div>
    );
  };
  
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordRequirements(validatePassword(newPassword));
  };
  
  const handleConfirmPwChange = (e) => {
    const confirmPw = e.target.value;
    setConfirmPw(confirmPw);
  
    if (confirmPw !== password) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  return (
    <div className='SP'> 
      <img className="imgSU" src="/dark-logo.png" alt="App Logo" />
      <div className="signUp-container">
      <h2 className="SU-header">Customer Sign Up</h2>
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
          <label className='SU-label'>Username</label>
          <input
            type="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="SIform-group">
          <label className='SU-label'>Password</label>
          <input
              type="password"
              className="SU-pw"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          
          {passwordRequirements}
        </div>
        <div className="SIform-group">
          <label className='SU-label'>Confirm Password</label>
          <input
            type="password"
            className="SU-pw"
            placeholder="Confirm your password"
            value={confirmPw}
            onChange={handleConfirmPwChange}
            required
          />
        </div>
        {passwordError && (
          <div className="pw-text">{passwordError}</div>
        )}
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
          <button className="reg-btn" onClick={() => navigate("/signin")}>Sign In</button>
        </div>
        {error && <p className="SU-error">{error}</p>}
        {success && <p className="SU-success">{success}</p>}
      </div>
    </div>
  );
};

export default SignUp;