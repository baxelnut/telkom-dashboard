import React from "react";
import "./Dropdown.css";

export default function Dropdown({ options, value, onChange }) {
  return (
    <select value={value} onChange={onChange} className="dropdown">
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
