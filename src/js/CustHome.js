import React, { useState, useEffect } from 'react';
import "../css/CustHome.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function CustHome() {
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch business data from Firestore
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "businesses"));
        const businessList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinesses(businessList);
      } catch (error) {
        console.error("Error fetching businesses: ", error);
      }
    };

    fetchBusinesses();
  }, []);

  // Handler for the search button
  const handleSearch = () => {
    // Filter businesses based on service name or location
    const results = businesses.filter((business) =>
      business.name.toLowerCase().includes(service.toLowerCase()) ||
      business.description.toLowerCase().includes(service.toLowerCase()) ||
      business.location.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredBusinesses(results);
  };

  return (
    <div>
      <header className="header-section">
        <img src="/light-logo.png" alt="App Logo" className="home-logo" />
        <h1>SlotSage</h1>
        <ul className="navbar-list">
          <li className="navbar-item"><a href="/signIn">Sign In</a></li>
          <li className="navbar-item"><a href="/contact">Sign Out</a></li>
        </ul>
      </header>

      <div className="home-page">
        <section className="search-section">
          <div className="search-bar-container">
            <div className="search-field search-main">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Any service or venue"
                value={service}
                onChange={(e) => setService(e.target.value)} 
              />
            </div>
            <div className="search-field search-loc">
              <i className="fas fa-map-marker-alt"></i>
              <input
                type="text"
                placeholder="Current location"
                value={location}
                onChange={(e) => setLocation(e.target.value)} 
              />
            </div>
            <div className="search-field">
              <i className="fas fa-calendar-alt"></i>
              <DatePicker
                showTimeSelect
                minTime={new Date(0, 0, 0, 9, 0)} // Set to the desired min time
                maxTime={new Date(0, 0, 0, 19, 0)} // Set to the desired max time
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select date and time"
              />
            </div>
            <button className="search-button" onClick={handleSearch}>Search</button>
          </div>
        </section>

        <section className="category-section">
          <h3 className="section-header">Browse Categories</h3>
          <div className="categories-grid">
            <div className="category-item">
              <img src="hair-salon.png" className="cat-img" alt="Hair Salon" />
              <p>Hair Salon</p>
            </div>
            <div className="category-item">
              <img src="skin-care.png" className="cat-img" alt="Spa" />
              <p>Spa Services</p>
            </div>
            <div className="category-item">
              <img src="car-wash-machine.png" className="cat-img" alt="Car Wash" />
              <p>Car Wash</p>
            </div>
            <div className="category-item">
              <img src="depilation.png" className="cat-img" alt="Hair Removal" />
              <p>Hair Removal</p>
            </div>
            <div className="category-item">
              <img src="manicure.png" className="cat-img" alt="Nail Services" />
              <p>Nail Services</p>
            </div>
            <div className="category-item">
              <img src="cosmetics.png" className="cat-img" alt="Eyebrow/Eyelash" />
              <p>Eyebrows/Lashes</p>
            </div>
            {/* Add more categories */}
          </div>
        </section>

        <section className="business-section">
          <h3 className="section-header">Popular Business Profiles</h3>
          <div className="business-grid">
            {(filteredBusinesses.length > 0 ? filteredBusinesses : businesses).map((business, index) => (
              <div className="business-item" key={index}>
                <h3>{business.name}</h3>
                <p>{business.description}</p>
                <p><strong>Location:</strong> {business.location}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CustHome;