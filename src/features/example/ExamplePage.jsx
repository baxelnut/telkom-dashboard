import { useState, useEffect } from "react";
import "./ExamplePage.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

export default function ExamplePage({ API_URL }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [hello, setHello] = useState(null);
  const [progressData, setProgressData] = useState(null);

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
          fetch(`${API_URL}/aosodomoro/reg_3_progress`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch hello data");
            return res.json();
          }),
        ]);

        const [aosodomoroResult, helloResult, progressResult] = responses;

        if (aosodomoroResult.status === "rejected") {
          throw new Error("Backend failed to fetch aosodomoro data.");
        }
        if (helloResult.status === "rejected") {
          throw new Error("Backend failed to fetch hello data.");
        }
        if (progressResult.status === "rejected") {
          throw new Error("Backend failed to fetch progress data.");
        }

        setData(aosodomoroResult.value);
        setHello(helloResult.value);
        setProgressData(progressResult.value);
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
    <div className="example-container">
      <h1>ExamplePage</h1>

      <div className="example-items">
        <h6>trynna fetch helloResponse from `${API_URL}/hello`</h6>

        <div className="example-content">
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} />
          ) : (
            <pre>{JSON.stringify(hello, null, 2)}</pre>
          )}
        </div>
      </div>

      <div className="example-items">
        <h6>
          trynna fetch progressResponse from `${API_URL}
          /aosodomoro/reg_3_progress`
        </h6>

        <div className="example-content">
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} />
          ) : (
            <p>{JSON.stringify(progressData, null, 2)}</p>
          )}
        </div>
      </div>

      <div className="example-items">
        <h6>trynna fetch aosodomoroResponse from `${API_URL}/aosodomoro`</h6>

        <div className="example-content">
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} />
          ) : (
            <p>{JSON.stringify(data, null, 2)}</p>
          )}
        </div>
      </div>

      <div className="example-items">
        <h6>dynamic universal component display</h6>

        <div className="component-display-container">
          <div className="component-display">
            <p>for loading:</p>
            <Loading />
          </div>
          <div className="component-display">
            <p>for error:</p>
            <Error />
          </div>
        </div>
      </div>
    </div>
  );
}
