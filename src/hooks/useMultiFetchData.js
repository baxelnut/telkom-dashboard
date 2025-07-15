import { useState, useEffect } from "react";

/**
 * Custom hook to fetch multiple API endpoints in parallel
 * @param {Object} endpoints - Object with key: URL
 * @param {boolean} [skip=false] - Whether to skip initial fetch
 * @returns {object} { data, loading, error, refetch, raw }
 */
export default function useMultiFetchData(endpoints = {}, skip = false) {
  const [data, setData] = useState({});
  const [raw, setRaw] = useState({});
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const keys = Object.keys(endpoints);
      const urls = Object.values(endpoints);

      const responses = await Promise.all(urls.map((url) => fetch(url)));

      // Check for failed fetches
      responses.forEach((res, i) => {
        if (!res.ok) throw new Error(`❌ Failed to fetch: ${urls[i]}`);
      });

      const jsonResults = await Promise.all(responses.map((res) => res.json()));

      // Build result as object
      const resultObj = {};
      const rawObj = {};

      keys.forEach((key, i) => {
        rawObj[key] = jsonResults[i]; 
        resultObj[key] = Array.isArray(jsonResults[i].data)
          ? jsonResults[i].data
          : jsonResults[i]; // fallback
      });

      setRaw(rawObj);
      setData(resultObj);
    } catch (err) {
      console.error("💥 useMultiFetchData error:", err);
      setError(
        err.message || "Something went wrong while fetching multiple endpoints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!skip && Object.keys(endpoints).length > 0) {
      fetchAll();
    }
  }, [JSON.stringify(endpoints)]); // Deep check

  return {
    data, // e.g., { ach: [...], po: [...] }
    raw, // raw JSON response
    loading,
    error,
    refetch: fetchAll,
  };
}
