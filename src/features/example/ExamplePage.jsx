import { useState, useEffect } from "react";

import "./ExamplePage.css";
import Loading from "../../components/Loading";

export default function ExamplePage() {
  const [data, setData] = useState(null);
  const [hello, setHello] = useState(null);

  const API_URL = import.meta.env.VITE_DEV_API;

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/data`);
      const helloResponse = await fetch(`${API_URL}/hello`);

      const data = await response.json();
      const hello = await helloResponse.json();

      setData(data);
      setHello(hello);
    } catch (error) {
      console.error("🚨 Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="example">
      <h1>ExamplePage</h1>
      <div className="example1">
        {hello ? <pre>{JSON.stringify(hello, null, 2)}</pre> : <Loading />}
      </div>
      {/* <div className="example1">
        {data ? <p>{JSON.stringify(data, null, 2)}</p> : <Loading />}
      </div> */}
    </div>
  );
}
