import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './App.css';

import CustHome from './js/CustHome';
import ServiceList from './js/ServiceList';
import Dashboard from './js/Dashboard';
import SignIn from './SignIn';
import SignUp from './js/SignUp';
import SP_SignUp from './js/SP_SignUp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);

        const SPref = doc(db, "serviceProviders", user.uid);
        const SPsnap = await getDoc(SPref);

        if (SPsnap.exists()) {
          setUserType('service-provider');
          navigate("/dashboard");
        } else {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserType('customer');
            navigate("/home");
          } else {
            console.log("User does not have a role.");
            setUserType(null); 
          }
        }
      } else {
        setIsAuthenticated(false);
        setUserType(null);
      }
      setLoading(false); 
    });

    return () => unsubscribe(); 
  }, [navigate]);

  const handleSignInClick = () => {
    navigate("/signin");
  };

  const handleSignUpSuccess = () => {
    navigate("/home");
  };

  const handleSPSignUp = () => {
    navigate("/dashboard");
  };

  const handleSignUpClick = (signUpType) => {
    if (signUpType === 'customerSignUp') {
      navigate('/signup');
    } else if (signUpType === 'SPSignUp') {
      navigate('/SPSignup');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin"); 
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  if (loading) {
    return <p>Loading user info...</p>; // Show loading message while fetching userType
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? (userType === 'service-provider' ? <Navigate to="/dashboard" /> : <Navigate to="/home" />) : <Navigate to="/signin" />} />
      <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated} onSignUpClick={handleSignUpClick} />} />
      <Route path="/signup" element={<SignUp onSignInClick={handleSignInClick} onSignUp={handleSignUpSuccess} />} />
      <Route path="/SPSignUp" element={<SP_SignUp onSignInClick={handleSignInClick} onSPSignUp={handleSPSignUp} />} />
      {isAuthenticated && (
        <>
          <Route path="/home" element={<CustHome />} />
          <Route path="/services" element={<ServiceList />} />
          <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
        </>
      )}
    </Routes>
  );  
}

export default App;