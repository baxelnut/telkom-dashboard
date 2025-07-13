import { useState, useEffect } from "react";

/**
 * Custom hook to fetch data from an API endpoint
 * @param {string} url - Full API URL to fetch
 * @param {boolean} [skip=false] - Skip fetching on mount
 * @returns {object} { data, loading, error, refetch }
 */

export default function useFetchData(url, skip = false) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text}`);
      }

      const result = await response.json();

      if (!Array.isArray(result.data)) {
        throw new Error(
          "Invalid response: expected result.data to be an array"
        );
      }

      setData(result.data);
    } catch (err) {
      console.error("oh no! useFetchData error:", err);
      setError(err.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!skip && url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
