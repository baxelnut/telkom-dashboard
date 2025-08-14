import { useState, useEffect } from "react";

/**
 * Custom hook to fetch data from an API endpoint
 * @param {string} url - Full API URL to fetch
 * @param {boolean} [skip=false] - Skip fetching on mount
 * @returns {object} { data, loading, error, refetch, raw }
 */
export default function useFetchData(url, skip = false) {
  const [data, setData] = useState([]);
  const [raw, setRaw] = useState(null);
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

      // Set raw result to access meta fields
      setRaw(result);

      if (!Array.isArray(result.data)) {
        throw new Error(
          "Invalid response: expected result.data to be an array"
        );
      }

      setData(result.data);
    } catch (err) {
      console.error("💥 useFetchData error:", err);
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

  return {
    data, // Array only (still safe for old components)
    raw, // Full response object (new)
    loading,
    error,
    refetch: fetchData,
  };
}
