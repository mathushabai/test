import React, { useState } from 'react';
import "../css/CustHome.css";

function CustHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const businesses = [
    { name: "John's Barbershop", description: "Men's grooming" },
    { name: "The Relaxation Spa", description: "Luxurious spa services" },
    { name: "Healing Hands Massage", description: "Therapeutic massage" },
    // Add more dummy businesses
  ];

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-page">
      <header className="header-section">
        <h1>SlotSage</h1>
        <input 
          type="text" 
          placeholder="Search for services or businesses..." 
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>

      <section className="category-section">
        <h2>Browse Categories</h2>
        <div className="categories-grid">
          <div className="category-item">
            <img src="hair.png" className="cat-img" alt="Hair Salon" />
            <p>Hair Salon</p>
          </div>
          <div className="category-item">
            <img src="spa.png" className="cat-img" alt="Spa" />
            <p>Spa Services</p>
          </div>
          <div className="category-item">
            <img src="car-wash.png" className="cat-img" alt="Car Wash" />
            <p>Car Wash</p>
          </div>
          <div className="category-item">
            <img src="henna.png" className="cat-img" alt="Henna" />
            <p>Henna Art</p>
          </div>
          {/* Add more categories */}
        </div>
      </section>

      <section className="business-section">
        <h2>Popular Business Profiles</h2>
        <div className="business-grid">
          {filteredBusinesses.map((business, index) => (
            <div className="business-item" key={index}>
              <h3>{business.name}</h3>
              <p>{business.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CustHome;