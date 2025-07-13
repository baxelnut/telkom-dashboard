import { useState } from "react";
// Style
import "./GalaksiReportPage.css";
// Components

export default function GalaksiReportPage({ API_URL }) {
  const [time, setTime] = useState(new Date());

  const formattedDate = `${
    time.getMonth() + 1
  }/${time.getDate()}/${time.getFullYear()}`;

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="report-page galaksi">
      <div className="card galaksi title">
        <h6>GALAKSI (GApai! kawaL! AKSI!) AOSODOMORO Non Conn</h6>
        <h6 className="small-h">{`${formattedDate} ${formattedTime}`}</h6>
      </div>

      <div className="card galaksi table"></div>
    </div>
  );
}
