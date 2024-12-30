import {
  faRocket,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import createApiCall, { GET } from "../api/api";
import MutatingDotsLoader from "../Loaders/MutatingDots";

function DashboardSidebar({ selectedDataSource }) {
  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  const fetchDashboardApi = createApiCall("dashboardAnalytics/{id}", GET);

  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    if (selectedDataSource) {
      setLoading(true);
      fetchDashboardApi({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        pathVariables: {
          id: selectedDataSource,
        },
      })
        .then((response) => {
          setLoading(false);
          setProcessedData(processData(response.data));
        })
        .catch((error) => {
          setLoading(false);
          console.error("Error fetching dashboard data:", error);
        });
    }
  }, [selectedDataSource]);

  function processData(input) {
    const metrics = input.filter((item) => item.type === "metrics");

    const sortedMetrics = metrics.sort((a, b) => {
      if (a.graphoption?.order < 0 && b.graphoption?.order < 0) {
        return a.graphoption?.order - b.graphoption?.order;
      }
      if (a.graphoption?.order < 0) return 1;
      if (b.graphoption?.order < 0) return -1;
      return a.graphoption?.order - b.graphoption?.order;
    });

    return sortedMetrics;
  }

  return loading ? (
    <div className="d-flex justify-content-center align-items-center flex-grow-1 h-100">
      <MutatingDotsLoader />
    </div>
  ) : (
    <div className="d-flex mt-4 h-100">
      <div className="container text-center">
        {processedData.length > 0 &&
          processedData.map((data, index) => (
            <div className="row justify-content-center" key={index}>
              <div className="col-10 mt-2">
                <div className="card text-center shadow-lg">
                  <div className="card-body">
                    <h3 className="font-weight-bold text-dark">
                      {data.data[0]
                        ? Object.values(data.data[0])[0]
                        : "No Value"}
                    </h3>
                    <h6 className="text-green">{data.title}</h6>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default DashboardSidebar;
