import React, { useState, useCallback } from "react";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from 'react-router-dom';
import { storage } from "../firebase"; 

const libraries = ['places'];

function SP_SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessImage, setBusinessImage] = useState(null);
  const [businessLicense, setBusinessLicense] = useState(null);
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState(null);
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
  const [businessDescription, setDescription] = useState('');
  const categories = ['Hair Salon', 'Hair Removal', 'Spa & Wellness', 'Nail Services', 'Henna','Makeup', 'Eyebrows & Lashes', 'Car Wash', 'Electrician' , 'Pet Care', 'Photography'];
  const [customCategory, setCustomCategory] = useState('');
  const [customCategoryAdded, setCustomCategoryAdded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [services, setServices] = useState([{ name: "", price: "", totalDuration: 0 }]);
  const [error, setError] = useState('');
  const [currentDay, setCurrentDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const navigate = useNavigate();

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

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setBusinessImage(e.target.files[0]);
    }
  };

  const handleLicenseChange = (e) => {
    if (e.target.files[0]) {
      setBusinessLicense(e.target.files[0]);
    }
  };

  const handleLicenseUpload = async () => {
    if (!businessLicense) return;

    const storageRef = ref(storage, `businessLicenses/${businessLicense.name}`);
    
    try {
      // Upload the file and get the URL
      const snapshot = await uploadBytes(storageRef, businessLicense);
      const url = await getDownloadURL(snapshot.ref);
      
      // Store the URL in the state (or wherever needed)
      setBusinessLicenseUrl(url);
    } catch (error) {
      console.error("Error uploading business license: ", error);
    }
  };

  // Google Maps API methods
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
    
    options: {
      types: ['address'],
      componentRestrictions: { country: 'my' }  
    }
  });

  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setBusinessAddress(place.formatted_address);
    }
  }, [autocomplete]);

  const onLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  }, []);

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
        setCustomCategoryAdded(false); // Hide the message after 3 seconds
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

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    if (field === "price") {
      updatedServices[index][field] = parseFloat(value); 
    } else if (field === "totalDuration") {
      updatedServices[index][field] = parseInt(value, 10);
    } else {
      updatedServices[index][field] = value;
    }

    setServices(updatedServices);
  };

  const handleAddService = () => {
    setServices([...services, { name: "", price: "", totalDuration: 0 }]);
  };

  const handleRemoveService = (index) => {
    const values = [...services];
    values.splice(index, 1);
    setServices(values);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Upload the business license file and get its URL
    await handleLicenseUpload();

    try {
      console.log("Creating user...");

      if (!email || !password || !confirmPw || !businessName || !mobileNumber || (!isRemote && !businessAddress)) {
        setError('Please fill in all the fields.');
        console.log("Validation failed. Missing required fields.");
        setTimeout(() => {
          setError('');
        }, 3000);

        return;
      } else if (!businessImage) {
        setError('Please select a business image.');
        setTimeout(() => {
          setError('');
        }, 3000);

        return;
      }

      // Upload image to Firebase Storage
      const imageRef = ref(storage, `businessImages/${businessImage.name}`);
      const snapshot = await uploadBytes(imageRef, businessImage);
      const imageUrl = await getDownloadURL(snapshot.ref);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;
      console.log("User created with UID:", user.uid);

      // Upload business image to Firebase Storage
      let businessImageUrl = '';
      if (businessImage) {
        const storageRef = ref(storage, `businessImages/${businessImage.name}`);
        const uploadTask = await uploadBytes(storageRef, businessImage);
        businessImageUrl = await getDownloadURL(uploadTask.ref); 
      }

      let businessLicenseUrl = ""; // Declare with 'let' if you intend to reassign

      if (businessLicense) {
        const licenseRef = ref(storage, `businessLicenses/${businessLicense.name}`);
        const licenseSnapshot = await uploadBytes(licenseRef, businessLicense);
        businessLicenseUrl = await getDownloadURL(licenseSnapshot.ref); // Now it can be reassigned
      }

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
      
      // Format services to ensure each service entry has `totalDuration` in minutes
      const formattedServices = services.map(service => ({
        name: service.name,
        price: parseFloat(service.price),
        totalDuration: parseInt(service.totalDuration, 10) || 0,
      }));

      console.log("Saving user data to Firestore...");
      await setDoc(doc(db, 'serviceProviders', uid), {
        email,
        mobileNumber,
        businessName,
        businessAddress: isRemote ? 'Remote Services' : businessAddress,
        businessHours: businessHrsDuo,
        categories: selectedCategories,
        businessDescription,
        services: formattedServices,
        businessImageUrl,
        businessLicenseUrl,
        accountStatus: 'pending',
        userType: 'service-provider',
      });

      console.log("Data saved to Firestore.");
      navigate("/dashboard");

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
            <label className='Image-label'>Business Image</label>
            <input 
              type="file" 
              onChange={handleFileChange} />
          </div>
          <div className="SPform-group">
            <label className='License-label'>Business License</label>
            <input 
              type="file" 
              onChange={handleLicenseChange} 
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
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  types: ['address'], 
                  componentRestrictions: { country: 'my' }
                }}
              >
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
              value={businessDescription}
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
            <label className='SC-label'>Selected Categories:</label>
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
          <div className="services-header">
            <label className="SP-label">Services</label>
          </div>
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
                  onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                  required
                />
              </div>
              <div className="SPform-group">
                <label className='Servicelbl'>Price</label>
                <span className="currency">RM</span>
                <input
                  className="service-input"
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  placeholder="Enter price"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                  required
                />
              </div>
              <div className="SPform-group">
                <label className="Servicelbl">Duration</label>
                <select
                  value={service.totalDuration || ""}
                  onChange={(e) => handleServiceChange(index, "totalDuration", e.target.value)}
                >
                  <option value="">Select Duration</option>
                  <option value="30">30 mins</option>
                  <option value="60">1 hr</option>
                  <option value="90">1 hr 30 mins</option>
                  <option value="120">2 hrs</option>
                  <option value="150">2 hrs 30 mins</option>
                  <option value="180">3 hrs</option>
                  <option value="210">3 hrs 30 mins</option>
                  <option value="240">4 hrs</option>
                </select>
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
          <button className="SPSI-btn" onClick={() => navigate("/signin")}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SP_SignUp);