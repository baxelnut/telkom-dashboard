import React, { useState, useEffect } from "react";
import "./GalaksiPage.css";
import GalaksiTable from "./GalaksiTable";
import AchExplaination from "./AchExplaination";

export default function GalaksiPage({ API_URL }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [dataRes, poRes] = await Promise.all([
          fetch(`${API_URL}/galaksi/data`),
          fetch(`${API_URL}/galaksi/po`),
        ]);

        if (!dataRes.ok || !poRes.ok) {
          throw new Error("❌ One or more API calls failed");
        }

        const dataResult = await dataRes.json();
        const poResult = await poRes.json();

        setData({ ach: dataResult, po: poResult });
      } catch (err) {
        console.error("🚨 Multi-Fetch Error:", err);
        setError(err.message || "Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedDate = `${
    time.getMonth() + 1
  }/${time.getDate()}/${time.getFullYear()}`;

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="galaksi-container">
      <div className="title-container">
        <h5>GALAKSI (GApai! kawaL! AKSI!) AOSODOMORO Non Conn</h5>
        <h6>{`${formattedDate} ${formattedTime}`}</h6>
      </div>

      <div className="galaksi-content-container">
        <AchExplaination />

        <div className="table-wrapper">
          <GalaksiTable galaksiData={data} loading={loading} error={error} />
        </div>
      </div>

      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}
