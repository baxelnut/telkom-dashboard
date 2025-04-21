import React from "react";
import "./Dropdown.css";

export default function Dropdown({ options = [], value = "", onChange }) {
  return (
    <select
      className="dropdown"
      value={value}
      onChange={onChange}
      style={{ fontWeight: isEmpty(value) ? 500 : 600 }}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          style={{ fontWeight: isEmpty(option.value) ? 500 : 600 }}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

function isEmpty(val) {
  return val === "" || val === " ";
}
