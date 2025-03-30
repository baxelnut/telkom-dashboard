import { useState, useEffect } from "react";
import "./ExamplePage.css";
import Loading from "../../components/Loading";

export default function ExamplePage() {
  const [data, setData] = useState(null);
  const [hello, setHello] = useState(null);

  const API_URL = import.meta.env.VITE_DEV_API;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/aosodomoro`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();

        console.log("🔥 API Response:", result);

        if (!result || !result.data) {
          throw new Error("Invalid API response structure");
        }

        setData(result.data);
        setTotalItems(result.total || 0);

        console.log(`📊 Total items: ${result.total}`);
        console.log(
          `📑 Showing ${result.data.length} items on page ${currentPage}`
        );
      } catch (error) {
        console.error("🚨 API Fetch Error:", error);
      }
    };

    fetchData();
  }, [currentPage]);

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
