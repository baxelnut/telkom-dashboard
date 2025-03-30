import { useState, useEffect } from "react";
import "./ExamplePage.css";
import Loading from "../../components/Loading";
import Error from "../../components/Error";

export default function ExamplePage() {
  const [data, setData] = useState(null);
  const [hello, setHello] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_DEV_API;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const responses = await Promise.allSettled([
          fetch(`${API_URL}/aosodomoro`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch aosodomoro data");
            return res.json();
          }),
          fetch(`${API_URL}/hello`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch hello data");
            return res.json();
          }),
        ]);

        const [aosodomoroResult, helloResult] = responses;

        if (aosodomoroResult.status === "rejected") {
          throw new Error("Backend failed to fetch aosodomoro data.");
        }
        if (helloResult.status === "rejected") {
          throw new Error("Backend failed to fetch hello data.");
        }

        setData(aosodomoroResult.value);
        setHello(helloResult.value);
      } catch (error) {
        console.error("🚨 API Fetch Error:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="example">
      <h1>ExamplePage</h1>

      <div className="example1">
        {loading ? (
          <Loading />
        ) : error ? (
          <Error message={error} />
        ) : (
          <pre>{JSON.stringify(hello, null, 2)}</pre>
        )}
      </div>

      <div className="example1">
        {loading ? (
          <Loading />
        ) : error ? (
          <Error message={error} />
        ) : (
          <p>{JSON.stringify(data, null, 2)}</p>
        )}
      </div>
    </div>
  );
}
