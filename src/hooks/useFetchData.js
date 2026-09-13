import { useState, useEffect, useCallback } from "react";

export default function useFetchData(url, skip = false) {
  const [data, setData] = useState([]);
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text}`);
      }

      const result = await response.json();
      setRaw(result);

      if (!Array.isArray(result.data)) {
        throw new Error(
          "Invalid response: expected result.data to be an array",
        );
      }

      setData(result.data);
    } catch (err) {
      console.error("💥 useFetchData error:", err);
      setError(err.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!skip && url) {
      fetchData();
    }
  }, [fetchData, skip, url]);

  return { data, raw, loading, error, refetch: fetchData };
}
