import { useState, useEffect } from "react";
// import axios from "axios";
import "./ExamplePage.css";
import Loading from "../../components/Loading";

export default function ExamplePage() {
  const [data, setData] = useState(null);
  const [hello, setHello] = useState(null);
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

  const API_URL = import.meta.env.VITE_API_URL;

  // usual
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/data`);
      const helloResponse = await fetch(`${API_URL}/hello`);

      const data = await response.json();
      const hello = await helloResponse.json(); // <- Should be from helloResponse

      setData(data);
      setHello(hello);

      console.log("🔥 Fetched Data:", data);
      console.log("🔥 Fetched Hello:", hello);
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
        {hello ? <pre>{JSON.stringify(hello, null, 2)}</pre> : <Loading />}
      </div>
      <div className="example1">
        {data ? <p>{JSON.stringify(data, null, 2)}</p> : <Loading />}
      </div>
    </div>
  );
}
