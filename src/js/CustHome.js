import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../css/CustHome.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

function CustHome({ onLogout }) {
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch business data from Firestore
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "serviceProviders"));
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

  // Filter businesses based on selectedCategory
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredBusinesses(businesses);
    } else {
      setFilteredBusinesses(
        businesses.filter((business) => business.categories.includes(selectedCategory))
      );
    }
  }, [selectedCategory, businesses]);

  const handleSearch = () => {
    const lowerCaseService = service ? service.toLowerCase() : '';
    const lowerCaseLocation = location ? location.toLowerCase() : '';

    const filtered = businesses.filter((business) =>
      (lowerCaseService === '' || 
        business.businessName.toLowerCase().includes(lowerCaseService) ||
        business.categories.some(category => category.toLowerCase().includes(lowerCaseService)) ||
        business.services.some(svc => svc.name.toLowerCase().includes(lowerCaseService))
      ) &&
      (lowerCaseLocation === '' || business.businessAddress.toLowerCase().includes(lowerCaseLocation))
    );

    setFilteredBusinesses(filtered);
  };

  const navigate = useNavigate();

const handleBusinessClick = (businessId) => {
  console.log(`Navigating to business with ID: ${businessId}`);
  navigate(`/business/${businessId}`);
};


  return (
    <div>
      <header className="header-section">
        <img src="/dark-logo.png" alt="App Logo" className="home-logo" />
        <h1>SlotSage</h1>
        <ul className="navbar-list">
        <li className="navbar-item">
          <a href="/profile"><FontAwesomeIcon icon={faUser}/></a>
        </li>
        <li className="navbar-item">
          <button onClick={onLogout} className="signOut-btn">
            <FontAwesomeIcon icon={faRightFromBracket}/>
          </button>
        </li>
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
            <button className="search-button" onClick={handleSearch}>Search</button>
          </div>
        </section>

        <section className="category-section">
          <h3 className="section-header">Browse Categories</h3>
          <div className="categories-grid">
            <div className={`category-item ${selectedCategory === 'All' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('All')}>
              <img src="select-all.png" className="cat-img" alt="All" />
              <p>All Services</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Hair Salon' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Hair Salon')}>
              <img src="hair-salon.png" className="cat-img" alt="Hair Salon" />
              <p>Hair Salon</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Makeup' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Makeup')}>
              <img src="makeup.png" className="cat-img" alt="Makeup" />
              <p>Makeup</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Spa & Wellness' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Spa & Wellness')}>
              <img src="spa-services.png" className="cat-img" alt="Spa & Wellness" />
              <p>Spa & Wellness</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Hair Removal' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Hair Removal')}>
              <img src="hair-removal.png" className="cat-img" alt="Hair Removal" />
              <p>Hair Removal</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Eyebrows & Lashes' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Eyebrows & Lashes')}>
              <img src="cosmetics.png" className="cat-img" alt="Eyebrows & Lashes" />
              <p>Eyebrows/Lashes</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Car Wash' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Car Wash')}>
              <img src="car-wash-machine.png" className="cat-img" alt="Car Wash" />
              <p>Car Wash</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Electrician' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Electrician')}>
              <img src="electrician.png" className="cat-img" alt="Electrician" />
              <p>Electrician</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Henna' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Henna')}>
              <img src="tattoo.png" className="cat-img" alt="Henna" />
              <p>Henna</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Pet Care' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Pet Care')}>
              <img src="animal.png" className="cat-img" alt="Pet Care" />
              <p>Pet Care</p>
            </div>
            <div className={`category-item ${selectedCategory === 'Photography' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('Photography')}>
              <img src="photo-camera.png" className="cat-img" alt="Photography" />
              <p>Photography</p>
            </div>
          </div>
        </section>

        <section className="business-section">
          <h3 className="section-header">{selectedCategory === 'All' ? 'Recently Added' : `${selectedCategory} Businesses`}</h3>
          <div className="business-grid">
          {(filteredBusinesses.length > 0 ? filteredBusinesses : businesses).map((business) => (
            // In the JSX where business cards are displayed, update the Link to use the click handler:
            <div onClick={() => handleBusinessClick(business.id)} key={business.id} className="business-card">
                <img src={business.businessImageUrl || "default-business.png"} alt={business.businessName} className="business-card-image" />
                <div className="business-card-content">
                  <h3>{business.businessName}</h3>
                  <p><strong>Location:</strong> {business.businessAddress}</p>
                </div>
                <div className="category-tags">
                  {business.categories && business.categories.map((category, idx) => (
                    <span key={idx} className="category-tag">{category}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CustHome;