import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import { useState } from "react";
import DashboardColumns from "./DashboardUtilityComponents/DashboardColumns";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import createApiCall, { GET } from "../api/api";
import { useEffect } from "react";
import {
  faDatabase,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import { toast, ToastContainer } from "react-toastify";

function DashboardMainContent() {
  const [dataSources, setDataSources] = useState();
  const [loading, setLoading] = useState(false);
  const [currentDataSource, setCurrentDataSource] = useState("");
  const [dashboardContent, setDashboardContent] = useState([]);
  const [stateChange, setChangeInState] = useState(false);

  const connectedDataSourcesApi = createApiCall("connecteddatabases", GET);
  const fetchDashboardApi = createApiCall("dashboardAnalytics/{id}", GET);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  // Fetch the connected DBSources
  useEffect(() => {
    if (!token) return;

    setLoading(true);

    connectedDataSourcesApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        setLoading(false);
        setDataSources(response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching configurable data sources:", error);
      });
  }, []);

  // Fetch Dashboards
  const handleFetchDashboards = (id) => {
    setDashboardContent([]);
    setLoading(true);
    fetchDashboardApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      pathVariables: {
        id: id,
      },
    })
      .then((response) => {
        setLoading(false);
        setDashboardContent(processData(response.data));
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching dashboard data:", error);
      });
  };

  // useEffect(() => {
  //   if (dashboardContent.length > 0) {
  //     console.log("Updated Dashboard Content:", dashboardContent);
  //   }
  // }, [dashboardContent]);

  // Helper function to convert the API Response
  const processData = (apiResponse) => {
    const chartData = apiResponse.map((item) => {
      const { graphoption, data, _id, query, title } = item;

      const xAxis = graphoption.coOrdinate.X;
      const y1Axis = graphoption.coOrdinate.Y1;
      const y2Axis = graphoption.coOrdinate.Y2 || "";

      const graphType = graphoption.graphType || "line";

      const graphData = {
        labels: [],
        datasets: [
          {
            label: y1Axis,
            data: [],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      };

      data.forEach((entry) => {
        const xValue = entry[xAxis];
        const y1Value = entry[y1Axis];
        graphData.labels.push(xValue);
        graphData.datasets[0].data.push(y1Value);
        if (y2Axis) {
          graphData.datasets.push({
            label: y2Axis,
            data: entry[y2Axis] || [],
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            fill: false,
          });
        }
      });

      return {
        id: _id,
        title: title,
        query: query,
        graphType: graphType,
        graphOptions: graphoption.options,
        graphData: graphData,
      };
    });

    return chartData;
  };

  const handleDragEnd = (event) => {
    setChangeInState(true);
    const { active, over } = event;
    if (active.id === over.id) return;

    setDashboardContent((content) => {
      const originalPos = content.findIndex((item) => item.id === active.id);
      const newPos = content.findIndex((item) => item.id === over.id);

      return arrayMove(content, originalPos, newPos);
    });
  };

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <>
      <ToastContainer />
      {/*Header */}
      <div>
        <div className="bg-light m-1 p-2 border rounded d-flex align-items-center flex-wrap">
          <div className="status">
            {stateChange && (
              <>
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="text-danger mx-2"
                />
                <span className="text-muted">Changes have not been saved</span>
              </>
            )}
          </div>

          {dataSources && dataSources.length > 0 ? (
            <>
              <FontAwesomeIcon className="ms-auto me-2" icon={faDatabase} />
              <select
                className="btn-menu rounded"
                name="dataSource"
                id="dataSource"
                value={currentDataSource || ""}
                onChange={(e) => {
                  setCurrentDataSource(e.target.value);
                  handleFetchDashboards(e.target.value);
                }}
              >
                <option value="">Select a Data Source</option>{" "}
                {/* No 'selected' attribute needed */}
                {dataSources.map((dataSource, index) => (
                  <option key={index} value={dataSource._id}>
                    {dataSource.tableName || "Unknown Database"}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <p className="ms-auto m-0">
              Welcome to <span className="text-green">Agino</span>. Connect a
              <a href="/datasource" className="text-decoration-none">
                {" "}
                datasource
              </a>{" "}
              to get started.
            </p>
          )}
        </div>
      </div>

      {/* Chat Body */}
      <div className="border chat-content overflow-auto mx-1 mb-2 rounded flex-grow-1 p-2 h-100">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center flex-grow-1 h-100">
            <MutatingDotsLoader />
          </div>
        ) : Object.keys(dashboardContent).length > 0 ? (
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCorners}
          >
            <DashboardColumns widgets={dashboardContent} />
          </DndContext>
        ) : (
          <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 h-100">
            <h2>
              Monitor your <span className="text-green">KPIs</span> with{" "}
              <span className="text-green">Agino</span>
            </h2>
            <ul className="mt-2">
              <li>
                To create a dashboard, start a new{" "}
                <span className="text-green">chat</span>.
              </li>
              <li>
                Click on "<span className="text-green">Visualize Data</span>" to
                generate <span className="text-green">graphs</span>.
              </li>
              <li>
                Select your desired <span className="text-green">graph</span>.
              </li>
              <li>
                Then add it to the <span className="text-green">dashboard</span>
                .
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default DashboardMainContent;
