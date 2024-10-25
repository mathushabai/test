import React, { useState } from "react";
import '../css/SP_SignUp.css';
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { createUserWithEmailAndPassword} from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCirclePlus, faCircleMinus, faCircleExclamation, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import TimePickerModal from '../TimePickerModal';
import "flatpickr/dist/themes/material_blue.css";
import { useLoadScript } from '@react-google-maps/api';
import { Autocomplete } from '@react-google-maps/api';
const libraries = ['places'];

function SP_SignUp({ onSignInClick, onSPSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [businessHours, setBusinessHours] = useState({
    Monday: { shifts: [] },
    Tuesday: { shifts: [] },
    Wednesday: { shifts: [] },
    Thursday: { shifts: [] },
    Friday: { shifts: [] },
    Saturday: { shifts: [] },
    Sunday: { shifts: [] },
  });
  const [description, setDescription] = useState('');
  const categories = ['Hair Services', 'Massage', 'Nails', 'Henna', 'Car Wash'];
  const [customCategory, setCustomCategory] = useState('');
  const [customCategoryAdded, setCustomCategoryAdded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [services, setServices] = useState([{ name: "", price: "", duration: "" }]);
  const [error, setError] = useState('');
  const [currentDay, setCurrentDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const apiKey = 'AIzaSyB0QsIHJw6042khNA-aOoBHeCfDy-xQInY'; 
  const [autocomplete, setAutocomplete] = useState(null);

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
    
    const validationError = validatePassword(newPassword);
    setPasswordError(validationError);
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

  // Google Maps API methods
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setBusinessAddress(place.formatted_address);
    }
  };

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handleSaveTime = (day, shift) => {
    if (shift.closed) {
      setBusinessHours(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          shifts: [{ start: 'Closed', end: 'Closed', closed: true }]
        }
      }));
    } else {
      const parseTime = (time) => {
        if (!time) return null;
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return date;
      };
  
      const formatTime12Hour = (time) => {
        if (!time) return '';
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      };
  
      const parsedShift = {
        start: formatTime12Hour(parseTime(shift.start)),
        end: formatTime12Hour(parseTime(shift.end)),
        closed: false
      };
  
      setBusinessHours(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          shifts: [parsedShift]
        }
      }));
    }
    setShowModal(false);
  };

  const openModal = (day) => {
    setCurrentDay(day);
    setShowModal(true);
  };

  const handleAddCustomCategory = () => {
    if (customCategory && !selectedCategories.includes(customCategory)) {
      setSelectedCategories([...selectedCategories, customCategory]);
      setCustomCategory('');
      setCustomCategoryAdded(true); 
      setTimeout(() => {
        setCustomCategoryAdded(false); // Hide the message after a delay (e.g., 3 seconds)
      }, 3000);
    }
  };

  const handleRemoveCategory = (category) => {
    setSelectedCategories(selectedCategories.filter(c => c !== category));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter(c => c !== value));
    } else {
      if (selectedCategories.length < 3) {
        setSelectedCategories([...selectedCategories, value]);
      } else {
        setError('You can only select up to 3 categories.');

        setTimeout(() => {
          setError('');
        }, 3000);
        return;
      }
    }
  };

  const handleServiceChange = (index, event) => {
    const values = [...services];
    values[index][event.target.name] = event.target.value;
    setServices(values);
  };

  const handleAddService = () => {
    setServices([...services, { name: "", price: "", duration: "" }]);
  };

  const handleRemoveService = (index) => {
    const values = [...services];
    values.splice(index, 1);
    setServices(values);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    try {

      console.log("Creating user...");

      if (!email || !password || !confirmPw || !businessName || !mobileNumber || (!isRemote && !businessAddress) || services.some(service => !service.name || !service.price || !service.duration)) {
        setError('Please fill in all the fields.');
        console.log("Validation failed. Missing required fields.");

        setTimeout(() => {
          setError('');
        }, 3000);

        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;
      console.log("User created with UID:", user.uid);

      // Organize business hours into opening and closing hours
      const businessHrsDuo = Object.keys(businessHours).reduce((hours, day) => {
        const shifts = businessHours[day].shifts;
        const openingHours = shifts.length ? shifts.map(shift => shift.start) : [];
        const closingHours = shifts.length ? shifts.map(shift => shift.end) : [];

        hours[day] = {
          openingHours,
          closingHours,
        };

        return hours;
      }, {});

      console.log("Saving user data to Firestore...");
      await setDoc(doc(db, 'serviceProviders', uid), {
        email,
        mobileNumber,
        businessName,
        businessAddress: isRemote ? 'Remote Services' : businessAddress,
        businessHours: businessHrsDuo,
        categories: selectedCategories,
        description,
        services,
        userType: 'service-provider',
      });

      console.log("Data saved to Firestore.");
      onSPSignUp();

    } catch (error) {
      console.error("Error signing up: ", error);
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <div className="sign-up-page">
      <img className="imgSP" src="/dark-logo.png" alt="App Logo" />
      <div className="SP_container">
        <h2 className="SP-header">Business Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <div className="SPform-group">
            <label className='Email-label'>Email</label>
            <input
              type="email"
              className="emailInput"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className='Mb-label'>Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter your mobile number"
              value={mobileNumber}
              className="mobileInput"
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>
          <div className="SPform-group">
            <label className='PW-label'>Password</label>
            <input
              type="password"
              className="pwInput"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <div id="pw-feedback"></div>
            <label className='PW2-label'>Confirm Password</label>
            <input
              type="password"
              className="pwInput"
              placeholder="Confirm your password"
              value={confirmPw}
              onChange={handleConfirmPwChange}
              required
            />
          </div>
          {passwordError && (
            <div className="pw-text">{passwordError}</div>
          )}
          <div className="SPform-group">
          <label className='BN-label'>Business Name</label>
            <input
              type="text"
              className="bnInput"
              placeholder="Enter your business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="SPform-group">
          <label className="service-label">Service Location</label>
            <label className="remotebox">
            Remote Services
            <input
              className="service-checkbox"
              type="checkbox"
              checked={isRemote}
              onChange={() => setIsRemote(!isRemote)}
            />
            </label>
          </div>
          <div className="SPform-group">
          <label className='BA-label'>Business Address</label>
            {typeof google !== 'undefined' && (
              <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} disabled={isRemote}>
                <input
                  type="text"
                  placeholder="Enter business address"
                  className="BAInput"
                  disabled={isRemote}
                  required={!isRemote}
                />
              </Autocomplete>
            )}
          </div>
          <div className="SPform-group">
            <label className='Desc-label'>Description (Optional)</label>
            <textarea
              placeholder="Describe your business"
              value={description}
              className="descriptionBox"
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          <div className="BHform-group">
            <label className='BH-label'>Business Hours</label>
            <div className="business-hours-table">
              {Object.keys(businessHours).map((day) => (
                <div key={day} className="day-row">
                  <label>{day}</label>
                  <button 
                    type="button" 
                    className="setHrs" 
                    onClick={() => openModal(day)}
                    title="Click to set the opening and closing hours for the day"
                  >
                    <FontAwesomeIcon icon={faClock} /> Set Hours
                  </button>
                  <ul className="hrsDisplay">
                    {businessHours[day].shifts.map((shift, index) => (
                      <li key={index}>
                        {shift.closed ? 'Closed' : `${shift.start || ''} - ${shift.end || ''}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="SPform-group">
            <label className='cat-label'>Categories</label>
            <div className="category-checkboxes">
              {categories.map((category) => (
                <div key={category}>
                  <input
                    type="checkbox"
                    value={category}
                    checked={selectedCategories.includes(category)}
                    onChange={handleCategoryChange}
                  />
                  <label>{category}</label>
                </div>
              ))}
              {error && <div className="error-message">{error}</div>}
              <div className="custom-category-wrapper">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="custom-category-input"
                />
                <button type="button" onClick={handleAddCustomCategory} className="add-category-btn">Add category</button>
              </div>
              {customCategoryAdded && <div className="success-message">Custom category added successfully!</div>}
            </div>
            <div className="selected-categories">
            <label className='BH-label'>Selected Categories:</label>
              <ul>
                {selectedCategories.map((category, index) => (
                  <li className="selected-cat-list" key={index}>
                    {category}
                    <button onClick={() => handleRemoveCategory(category)} className="remove-category-btn">
                      <FontAwesomeIcon icon={faCircleMinus} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <label className="SP-label">Services</label>
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="SPform-group">
                <label className='Servicelbl'>Service Name</label>
                <input
                  className="service-input"
                  type="text"
                  name="name"
                  placeholder="Enter service name"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, e)}
                  required
                />
              </div>
              <div className="SPform-group">
                <label className='Servicelbl'>Price</label>
                <span className="currency">RM</span>
                <input
                  className="service-input"
                  type="text"
                  name="price"
                  placeholder="Enter price"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, e)}
                  required
                />
              </div>
              <div className="SPform-group">
                <label className='Servicelbl'>Duration</label>
                <input
                  className="service-input"
                  type="text"
                  name="duration"
                  placeholder="Enter duration (e.g., 1h 30min)"
                  value={service.duration}
                  onChange={(e) => handleServiceChange(index, e)}
                  required
                />
              </div>
              <button type="button" onClick={() => handleRemoveService(index)} className="remove-btn">
                <FontAwesomeIcon icon={faCircleMinus} />
              </button>
            <button type="button" onClick={handleAddService} className="add-btn">
                <FontAwesomeIcon icon={faCirclePlus} />
              </button>

            </div>
          ))}

          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="SP-sub submit-btn">Sign Up</button>
        </form>

        {showModal && (
          <TimePickerModal
            day={currentDay}
            onSave={handleSaveTime}
            onCancel={() => setShowModal(false)}
          />
        )}

        <div className="SI-group">
          <p className="signIn-text">Already have an account? Sign in instead:</p>
          <button className="SPSI-btn" onClick={onSignInClick}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default SP_SignUp;