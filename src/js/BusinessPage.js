import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import LoadingPage from './LoadingPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import '../css/BusinessPage.css';

const libraries = ["places"];

async function getCoordinatesFromAddress(address) {
    const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
  
    try {
        const response = await fetch(geocodingApiUrl);
        const data = await response.json();
      
        if (data.status === "OK") {
            const location = data.results[0].geometry.location;
            return location; 
        } else {
            console.error("Geocoding API error:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Error fetching geocoding data:", error);
        return null;
    }
}

function BusinessPage( {onLogout} ) {
    const { businessId } = useParams();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [mapCenter, setMapCenter] = useState(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const sortedBusinessHours = dayOrder.map(day => {
        const hours = business?.businessHours?.[day] || { openingHours: [], closingHours: [] };
        return { day, hours };
    });

    // Fetch business data from Firestore based on business ID
    useEffect(() => {
        const fetchBusiness = async () => {
        try {
            const docRef = doc(db, 'serviceProviders', businessId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Business data:", data);
                setBusiness(data);

                if (data.businessAddress && !data.businessAddress.latitude) {
                    const location = await getCoordinatesFromAddress(data.businessAddress);
                    if (location) {
                        setMapCenter({ lat: location.lat, lng: location.lng });
                    }
                } else if (data.businessAddress) {
                    setMapCenter({
                        lat: data.businessAddress.latitude,
                        lng: data.businessAddress.longitude,
                    });
                }
            } else {
                console.log("No such business document!");
            }
        } catch (error) {
            console.error("Error fetching business data: ", error);
        } finally {
            setLoading(false);
        }};

        fetchBusiness();
    }, [businessId]);

    if (loading) {
        return <LoadingPage />;
    }

    if (!business) {
        return <p>Business not found</p>;
    }

    if (!isLoaded) {
        return <p>Loading Map...</p>;
    }
    
    const { businessName = "Business Name", services = [], businessDescription = "No description available", businessAddress = "No address available", additionalInfo = [], businessImageUrl = "" } = business;

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
            <div className="business-page">
                <div className="business-container">
                    {/* Header Section */}
                    <div className="business-header">
                        <h1>{businessName}</h1>
                        {businessImageUrl && (
                            <img
                                src={businessImageUrl}
                                alt={`${businessName}`}
                                className="business-image"
                            />
                        )}
                    </div>

                    {/* Services Section */}
                    <section className="services-section">
                        <h2 className="business-sub">Services</h2>
                        <div className="service-cards">
                            {services && services.map((service, index) => {
                                // Calculate hours and minutes
                                const hours = Math.floor(service.totalDuration / 60);
                                const minutes = service.totalDuration % 60;
                                const formattedDuration = `${hours ? `${hours} hr${hours > 1 ? "s" : ""}` : ""}${hours && minutes ? ", " : ""}${minutes ? `${minutes} min${minutes > 1 ? "s" : ""}` : ""}`;

                                // Ensure price is a number
                                const price = parseFloat(service.price);
                                const formattedPrice = isNaN(price) ? service.price : `RM ${price.toFixed(2)}`;

                                return (
                                    <div key={index} className="service-card">
                                        <label className="service-name">{service.name}</label>
                                        <p className="service-duration">{formattedDuration}</p>
                                        <p className="service-price">{formattedPrice}</p>
                                        <button className="book-button" onClick={() => navigate(`/book/${businessId}`)}>Book Now</button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* About Section */}
                    <section className="about-section">
                        <h2 className="business-sub">About</h2>
                        <p className="business-desc">{businessDescription}</p>
                        <h2 className="business-sub">Busines Address</h2>
                        {isLoaded && mapCenter && (
                        <div className="map">
                            <GoogleMap
                            center={mapCenter}
                            zoom={15}
                            mapContainerStyle={{ width: '100%', height: '300px' }}
                            >
                            <Marker position={mapCenter} />
                            </GoogleMap>
                        </div>
                        )}
                        <address>{businessAddress}</address>
                    </section>
                
                <div className="side-container">
                    {/* Info Section */}
                    <section className="info-section">
                        <h2 className="business-sub">Opening Times</h2>
                        <ul className="opening-hours-list">
                            {sortedBusinessHours.map(({ day, hours }, index) => (
                            <li key={index}>
                                <label className="dayText">{day}</label>{' '}
                                {hours.openingHours[0] === "Closed" ? "Closed" : `${hours.openingHours[0]} - ${hours.closingHours[0]}`}
                            </li>
                            ))}
                        </ul>

                        {/* Contact Information */}
                        <h2 className="business-sub">Contact Info</h2>
                        <div className="contact-info">
                            {business.mobileNumber && (
                                <p className="contact-item">
                                    <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                                    {business.mobileNumber}
                                </p>
                            )}
                            {business.email && (
                                <p className="contact-item">
                                    <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                                    {business.email}
                                </p>
                            )}
                        </div>
                    </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BusinessPage;