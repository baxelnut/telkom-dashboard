import { useState, useEffect } from "react";
import axios from "axios";
import "./ExamplePage.css";

export default function ExamplePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/data")
      .then((response) => {
        console.log("🔥 API Response:", response.data);
        setData(response.data);
      })
      .catch((error) => console.error("🚨 API Error:", error));
  }, []);

  return (
    <div className="example">
      <h1>ExamplePage</h1>
      <div className="example1">
        <p>{data ? JSON.stringify(data, null, 2) : "Loading..."}</p>
      </div>
    </div>
  );
}
