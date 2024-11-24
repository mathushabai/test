import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { getDoc, doc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import Modal from 'react-modal';
import { sendBookingConfirmation } from './EmailTemplate';
import '../css/BookingPage.css';

function BookingPage({ onLogout }) {
  const { businessId } = useParams();
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [businessHours, setBusinessHours] = useState(null);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const userInfo = {
    email: auth.currentUser?.email,
    username: auth.currentUser?.username,  
  };

  useEffect(() => {
    const loadServicesAndBusinessHours = async () => {
      const fetchedServices = await fetchServices(businessId);
      setServices(fetchedServices);

      const businessData = await fetchBusinessData(businessId);
      setBusinessHours(businessData?.businessHours || {});
    };

    loadServicesAndBusinessHours();
  }, [businessId]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate); // Fetch blocked slots on date change
    }
  }, [selectedDate]);

  const fetchServices = async (businessId) => {
    try {
      const serviceProviderDocRef = doc(db, "serviceProviders", businessId);
      const serviceProviderDoc = await getDoc(serviceProviderDocRef);
      return serviceProviderDoc.exists() ? serviceProviderDoc.data().services || [] : [];
    } catch (error) {
      console.error("Error fetching services from Firestore:", error);
      return [];
    }
  };

  const fetchBusinessData = async (businessId) => {
    try {
      const businessDocRef = doc(db, "serviceProviders", businessId);
      const businessDoc = await getDoc(businessDocRef);
      return businessDoc.exists() ? businessDoc.data() : null;
    } catch (error) {
      console.error("Error fetching business data:", error);
      return null;
    }
  };

  const handleServiceToggle = (service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    const updatedServices = isSelected
      ? selectedServices.filter((s) => s.id !== service.id)
      : [...selectedServices, service];

    setSelectedServices(updatedServices);
    updateTotalCost(updatedServices);
  };

  const updateTotalCost = (selectedServices) => {
    const cost = selectedServices.reduce((sum, service) => sum + parseFloat(service.price), 0);
    setTotalCost(cost);
  };

  const formatDateToYYYYMMDD = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const showServiceDetails = (service) => {
    setCurrentService(service);
    setModalIsOpen(true);
  };
  
  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentService(null);
  };

  const fetchBookedSlots = async (date) => {
    try {
      const bookingsRef = collection(db, "serviceProviders", businessId, "bookings");
      const bookingsQuery = query(bookingsRef, where("date", "==", date));
      const querySnapshot = await getDocs(bookingsQuery);

      let allBlockedSlots = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.timeSlot && data.services) {
          const startTime = data.timeSlot;

          for (const serviceName of data.services) {
            const service = await fetchServiceByName(serviceName);
            if (service) {
              const duration = service.totalDuration;
              const slotsToBlock = calculateBlockedSlots(startTime, duration);
              allBlockedSlots = allBlockedSlots.concat(slotsToBlock);
            }
          }
        }
      }

      setBlockedSlots([...new Set(allBlockedSlots)]);
      generateTimeSlots(date, [...new Set(allBlockedSlots)]);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  const fetchServiceByName = async (serviceName) => {
    try {
      const serviceProviderDocRef = doc(db, "serviceProviders", businessId);
      const serviceProviderDoc = await getDoc(serviceProviderDocRef);
      const services = serviceProviderDoc.exists() ? serviceProviderDoc.data().services : [];
      return services.find(service => service.name === serviceName) || null;
    } catch (error) {
      console.error("Error fetching service by name:", error);
      return null;
    }
  };

  const calculateBlockedSlots = (startTime, duration) => {
    const blockedSlots = [];
    let [currentHour, currentMinute] = startTime.split(':').map(Number);
    let totalMinutes = duration;

    while (totalMinutes > 0) {
      blockedSlots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
      currentMinute += 30;
      if (currentMinute === 60) {
        currentMinute = 0;
        currentHour += 1;
      }
      totalMinutes -= 30;
    }
    return blockedSlots;
  };

  const generateTimeSlots = (date, blockedTimes = []) => {
    setIsClosed(false); // Reset closed message
  
    if (!businessHours) {
      console.warn("No business hours available.");
      return;
    }
  
    const dayOfWeek = new Date(date).toLocaleString('en-MY', { weekday: 'long' });
    const hoursForDay = businessHours[dayOfWeek];
  
    // Check if the business is closed on the selected day
    if (!hoursForDay || !hoursForDay.openingHours || !hoursForDay.closingHours) {
      setIsClosed(true);
      setTimeSlots([]);
      return;
    }
  
    const parseTime = (timeString) => {
      const [time, modifier] = timeString.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
  
      let parsedHours = hours;
      if (modifier === "PM" && hours !== 12) parsedHours += 12;
      if (modifier === "AM" && hours === 12) parsedHours = 0;
  
      return { hours: parsedHours, minutes };
    };
  
    const openingTime = parseTime(hoursForDay.openingHours[0]);
    const closingTime = parseTime(hoursForDay.closingHours[0]);
  
    // Validate parsed opening/closing times
    if (isNaN(openingTime.hours) || isNaN(closingTime.hours)) {
      setIsClosed(true);
      setTimeSlots([]);
      return;
    }
  
    const generatedSlots = [];
    let currentHour = openingTime.hours;
    let currentMinute = openingTime.minutes;
  
    while (
      currentHour < closingTime.hours ||
      (currentHour === closingTime.hours && currentMinute < closingTime.minutes)
    ) {
      const timeSlot = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
      generatedSlots.push(timeSlot);
  
      // Increment time by 30 minutes
      currentMinute += 30;
      if (currentMinute === 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }
  
    // Filter out blocked slots
    const availableSlots = generatedSlots.filter((slot) => !blockedTimes.includes(slot));
    setTimeSlots(availableSlots);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(formatDateToYYYYMMDD(date));
  };

  const handleTimeSlotClick = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleConfirmBooking = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service before confirming the booking.");
      return;
    }
  
    if (!selectedTimeSlot) {
      alert("Please select a time slot before confirming the booking.");
      return;
    }
  
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot || selectedServices.length === 0) {
      alert("Please select a date, time slot, and at least one service.");
      return;
    }
  
    try {
      // Retrieve user details from the 'users' collection
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
  
      // Retrieve business details from the 'serviceProviders' collection
      const businessDocRef = doc(db, "serviceProviders", businessId);
      const businessDoc = await getDoc(businessDocRef);
  
      if (userDoc.exists() && businessDoc.exists()) {
        const userData = userDoc.data();
        const businessData = businessDoc.data();
  
        // Prepare the booking data with additional business details
        const bookingData = {
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          services: selectedServices.map(service => ({
            name: service.name,
            duration: service.totalDuration,
            price: service.price
          })),
          totalCost,
          paymentStatus: "Confirmed",
          paymentMethod,
          customerEmail: userData.email,
          customerName: userData.username,
          businessName: businessData.businessName,
          businessAddress: businessData.businessAddress,
          businessPhone: businessData.mobileNumber
        };
  
        // Store booking in service provider's bookings
        const bookingsRef = collection(db, "serviceProviders", businessId, "bookings");
        await addDoc(bookingsRef, bookingData);
  
        // Store booking in user's collection
        const userBookingRef = collection(db, "users", userId, "bookings");
        await addDoc(userBookingRef, bookingData);
  
        const recipientEmail = userData.email;
        sendBookingConfirmation(recipientEmail, bookingData);
  
        alert("Booking confirmed and email sent!");
        setShowPaymentModal(false);

        // Refresh the page to update available slots
        window.location.reload();
      } else {
        console.error("User or business document not found in Firestore.");
        alert("User or business details not found.");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("An error occurred while confirming the booking.");
    }
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

      <div className="booking-page">
        <div className="content-container">
          {/* Left Column */}
          <div className="left-column">
            <div className="service-selection">
              <h2>Select Services</h2>
              {services.map((service, index) => (
                <div className="service-listing" key={index}>
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                  />
                  <span>{service.name} ({service.totalDuration} mins) - RM {service.price}</span>
                  <button className="view-details-btn" onClick={() => showServiceDetails(service)}>
                    Details
                  </button>
                </div>
              ))}
            </div>
        
            <div className="date-time-selection">
              <h2>Select Date & Time</h2>
              <input
                type="date"
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {isClosed ? (
              <p className="closed-message">This business is closed on the selected day.</p>
            ) : (
              timeSlots.length > 0 && (
                <div className="time-slots">
                  <h3>Available Time Slots</h3>
                  <div className="time-slot-container">
                    {timeSlots.map((slot, index) => (
                      <button
                        key={index}
                        className={`time-slot ${slot === selectedTimeSlot ? 'selected' : ''}`}
                        onClick={() => handleTimeSlotClick(slot)}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            <div className="summary-container">
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                {selectedServices.map((service, index) => (
                  <p key={service.id || index}>
                    {service.name} - {service.totalDuration} mins - RM {service.price}
                  </p>
                ))}
                <p className="totalText">Total Cost: RM {totalCost.toFixed(2)}</p>
                
                {!selectedTimeSlot && (
                  <p className="validate-msg">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="error-icon" />
                    Please select a time slot to proceed.
                  </p>
                )}

                <button
                  className="confirm-button"
                  onClick={handleConfirmBooking}
                  disabled={!selectedTimeSlot}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="opening-hours">
              <h2>Opening Hours</h2>
              <ul>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => {
                  const hours = businessHours?.[day] || { openingHours: ["Closed"], closingHours: [""] };
                  return (
                    <li key={index}>
                      <label className="dayText">{day}</label>{' '}
                      {hours.openingHours[0] === "Closed" ? "Closed" : `${hours.openingHours[0]} - ${hours.closingHours[0]}`}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={`payment-container ${showPaymentModal ? 'visible' : 'hidden'}`}>
              <div className="payment-modal-inline">
                <h2>Select Payment Method</h2>
                <select className="payment-select" onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                  <option value="">Select a payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Online Banking">Online Banking</option>
                </select>
                <button className="payment-submit" onClick={handlePaymentSubmit}>Submit Payment</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Component */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Service Details"
        className="service-details-modal"
        overlayClassName="modal-overlay"
      >
        <h2>{currentService?.name}</h2>
        <p>Duration: {currentService?.totalDuration} mins</p>
        <p>Price: RM {currentService?.price}</p>
        <p>Description: {currentService?.description || 'No description available.'}</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
}

export default BookingPage;