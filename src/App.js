import React, { useState, useEffect } from "react";
import './App.css';
import SignIn from "./SignIn";
import CustomerSignUp from "./SignUp";
import ServiceProviderSignUp from "./SP_SignUp";
import CustHome from "./CustHome";
import ServiceList from "./ServiceList";
import Header from "./Header";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setPage("home");
    }
  }, []);

  const handleSignIn = (email, password) => {
    const userData = { email }; // Add more fields if necessary
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    //setPage("home");
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    //setPage("signin");
  };

  const handleCategoryClick = (route) => {
    setPage(route); // Set page to the category
  };

  // Optional: Handle navigation to settings (if needed)
  const handleSettingsClick = () => {
    setPage("settings");
  };

  return (
    <div className="App">
      {/* Conditionally show header for all pages except service provider dashboard */}
      {page !== "serviceprovider_dashboard" && <Header />}

      {!user && page === "signin" && <SignIn onSignIn={handleSignIn} />}
      {page === "signup" && <CustomerSignUp onSignUp={() => setPage("signin")} />}
      {page === "serviceprovider_signup" && (
        <ServiceProviderSignUp onSignUp={() => setPage("signin")} />
      )}

      {/* Customer Home Page */}
        <CustHome
          onCategoryClick={handleCategoryClick}
          onSettingsClick={handleSettingsClick}
          onSignOut={handleSignOut}
        />

      {/* Display service providers based on selected category */}
      {page === "/hairdressing" && <ServiceList category="Hairdressing" />}
      {page === "/massages" && <ServiceList category="Massages" />}
      {page === "/car-washes" && <ServiceList category="Car Washes" />}

      {/* Settings Page (optional) */}
      {page === "settings" && <div>Settings Page (Under Construction)</div>}
    </div>
  );
}

export default App;