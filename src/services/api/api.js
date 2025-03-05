const API_BASE_URL = "http://localhost:5000";

export const fetchData = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/data");
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
