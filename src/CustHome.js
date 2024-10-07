import React from "react";
import "./CustHome.css";

const categories = [
  { name: "Hairdressing", icon: "💇‍♀️", route: "/hairdressing" },
  { name: "Massages", icon: "💆‍♂️", route: "/massages" },
  { name: "Car Washes", icon: "🚗", route: "/car-washes" },
  { name: "Spa Services", icon: "🧖‍♀️", route: "/spa" }
];

function CustHome({ onCategoryClick, onSettingsClick }) {
  return (
    <div className="home-page-container">
      {/* Header */}
      <header className="home-header">
      </header>

      {/* Category List */}
      <div className="categories-container">
        {categories.map((category) => (
          <div
            key={category.name}
            className="category-card"
            onClick={() => onCategoryClick(category.route)}
          >
            <span className="category-icon">{category.icon}</span>
            <p>{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustHome;