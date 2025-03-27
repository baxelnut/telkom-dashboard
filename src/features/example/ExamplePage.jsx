import { useState, useEffect } from "react";
import axios from "axios";
import "./ExamplePage.css";

export default function ExamplePage() {
  const [data, setData] = useState(null);
  // i use axios and python
  // useEffect(() => {
  //   axios
  //     .get("http://127.0.0.1:8000/data")
  //     .then((response) => {
  //       console.log("🔥 API Response:", response.data);
  //       setData(response.data);
  //     })
  //     .catch((error) => console.error("🚨 API Error:", error));
  // }, []);

  // usual
  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data");
      const data = await response.json();
      setData(data);
      console.log("🔥 Fetched Data:", data);
    } catch (error) {
      console.error("🚨 Fetch Error:", error);
    }
  };

  // axios and node.js
  // const fetchData = async () => {
  //   try {
  //     const { data } = await axios.get("http://localhost:5000/api/data");
  //     setData(data);
  //     console.log("🔥 Axios Fetched Data:", data);
  //   } catch (error) {
  //     console.error("🚨 Axios Error:", error);
  //   }
  // };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="example">
      <h1>ExamplePage</h1>
      <div className="example1">
        <pre>{data ? JSON.stringify(data, null, 2) : "Loading..."}</pre>
      </div>
    </div>
  );
}
