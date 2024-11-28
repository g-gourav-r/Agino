import { useEffect, useState } from "react";
import createApiCall, { GET } from "../api/api.jsx";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";

function DataSourceSideBar({ refreshDataSourceSideBar }) {
  const [connectedDataSources, setConnectedDataSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectedDataSourcesApiCall = createApiCall("connecteddatabases", GET);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  useEffect(() => {
    if (!token) return;

    setLoading(true);

    connectedDataSourcesApiCall({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        setLoading(false);
        setConnectedDataSources(response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching data sources:", error);
      });
  }, [refreshDataSourceSideBar]);

  return (
    <div className="d-flex flex-grow-1 flex-column h-100">
      <div className="text-center pt-2">
        <h5>My Data Sources</h5>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <MutatingDotsLoader />
        </div>
      ) : (
        <>
          {connectedDataSources.length > 0 ? (
            connectedDataSources.map((source) => (
              <div
                className="btn-black-reverse m-1 rounded p-0 border"
                key={source._id}
              >
                <p className="text-truncate m-1 rounded">
                  <FontAwesomeIcon className="mx-2" icon={faDatabase} />
                  {source.aliasName ? source.aliasName : source.database}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center text-black">
              No connected data sources found.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DataSourceSideBar;
