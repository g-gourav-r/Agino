import { useEffect, useState } from "react";
import createApiCall, { GET } from "../api/api.jsx";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";

function DataSourceSideBar({ refreshDataSourceSideBar, setShowDataBaseTable }) {
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
              <button
                key={source._id}
                id={source._id}
                className="mx-2 rounded btn-outline border-bottom note-item p-1 mb-2 text-start"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title={`${
                  source.aliasName ? source.aliasName : source.database
                }`}
                onClick={() => setShowDataBaseTable(source._id)}
              >
                <p
                  className="text-truncate m-1 rounded"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title={source.aliasName || source.database}
                >
                  <FontAwesomeIcon className="mx-2" icon={faDatabase} />
                  {source.aliasName ? source.aliasName : source.database}
                </p>
              </button>
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
