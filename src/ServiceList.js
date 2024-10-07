import React, { useEffect, useState } from "react";
import { db } from "./firebase"; // Import Firebase config

function ServiceList({ category }) {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      const providersRef = db.collection("serviceProviders").where("category", "==", category);
      const snapshot = await providersRef.get();
      const providersData = snapshot.docs.map((doc) => doc.data());
      setProviders(providersData);
    };

    fetchProviders();
  }, [category]);

  return (
    <div>
      <h2>Service Providers in {category}</h2>
      <div className="service-provider-list">
        {providers.map((provider, index) => (
          <div key={index} className="service-provider-card">
            <img src={provider.profileImageURL} alt={provider.businessName} style={{ width: '200px', height: '150px' }} />
            <h3>{provider.businessName}</h3>
            <p>{provider.description}</p>
            <p>Location: {provider.address}</p>
            <p>Contact: {provider.mobileNum}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceList;