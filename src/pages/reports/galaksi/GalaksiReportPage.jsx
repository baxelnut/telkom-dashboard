import { useState } from "react";
import { Helmet } from "react-helmet-async";
// Style
import "./GalaksiReportPage.css";
// Components
import AchExplaination from "../../../features/reports/galaksi/AchExplaination";
import CardContent from "../../../components/ui/cards/CardContent";
import GalaksiTable from "../../../features/reports/galaksi/GalaksiTable";
// Custom hook
import useMultiFetchData from "../../../hooks/useMultiFetchData";

export default function GalaksiReportPage({ API_URL }) {
  const [time, setTime] = useState(new Date());

  const { data, loading, error } = useMultiFetchData({
    ach: `${API_URL}/galaksi/data`,
    po: `${API_URL}/galaksi/po`,
  });

  const formattedDate = `${
    time.getMonth() + 1
  }/${time.getDate()}/${time.getFullYear()}`;

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="report-page galaksi">
      <Helmet>
        <title>GALAKSI Report | Telkom</title>
        <meta
          name="description"
          content="Detailed report and metrics for GALAKSI program under Telkom Indonesia. For internal evaluation only."
        />
      </Helmet>

      <div className="card galaksi title">
        <h6>GALAKSI (GApai! kawaL! AKSI!) AOSODOMORO Non Conn</h6>
        <h6 className="small-h">{`${formattedDate} ${formattedTime}`}</h6>
      </div>
      <div className="card galaksi table">
        <AchExplaination />
        <CardContent
          loading={loading}
          error={error}
          children={
            <GalaksiTable
              achData={data.ach}
              poData={data.po}
              API_URL={API_URL}
            />
          }
        />
      </div>
    </div>
  );
}
