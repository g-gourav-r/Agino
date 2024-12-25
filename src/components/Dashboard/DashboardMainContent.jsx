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
import createApiCall, { GET, PUT } from "../api/api";
import { useEffect } from "react";
import {
  faDatabase,
  faExclamationCircle,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import { toast, ToastContainer } from "react-toastify";

function DashboardMainContent({ setSelectedDataSource }) {
  const [dataSources, setDataSources] = useState();
  const [loading, setLoading] = useState(false);
  const [currentDataSource, setCurrentDataSource] = useState("");
  const [dashboardContent, setDashboardContent] = useState([]);
  const [stateChange, setChangeInState] = useState(false);

  const connectedDataSourcesApi = createApiCall("connecteddatabases", GET);
  const fetchDashboardApi = createApiCall("dashboardAnalytics/{id}", GET);
  const updateDashboardApi = createApiCall("dashboardAnalytics", PUT);

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

        // Separate graph and metrics types
        const graphs = response.data.filter((item) => item.type === "graph");
        const metrics = response.data.filter((item) => item.type === "metrics");

        // Sort only the graphs (add check for graphoption and order)
        const sortedGraphs = graphs.sort((a, b) => {
          const orderA = a.graphoption?.order ?? -1;
          const orderB = b.graphoption?.order ?? -1;

          if (orderA === -1) return 1;
          if (orderB === -1) return -1;
          return orderA - orderB;
        });

        // Combine sorted graphs with metrics (metrics remain unchanged)
        const sortedContent = [...sortedGraphs, ...metrics];

        // Process and set dashboard content
        setDashboardContent(processData(sortedContent, id));
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
  const processData = (apiResponse, dataSource) => {
    // Filter only items where type is "graph"
    return apiResponse
      .filter((item) => item.type === "graph")
      .map((item) => {
        const { graphoption, data, _id, query, title } = item;
        const xAxis = graphoption.coOrdinate.X;
        const y1Axis = graphoption.coOrdinate.Y1;
        const y2Axis = graphoption.coOrdinate.Y2 || "";

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
          graphData.labels.push(entry[xAxis]);
          graphData.datasets[0].data.push(entry[y1Axis]);

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
          database: dataSource,
          title: title,
          query: query,
          graphoption: graphoption,
          graphData: graphData,
        };
      });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDashboardContent((content) => {
      const originalPos = content.findIndex((item) => item.id === active.id);
      const newPos = content.findIndex((item) => item.id === over.id);

      const updatedContent = arrayMove(content, originalPos, newPos);

      return updatedContent.map((item, index) => ({
        ...item,
        graphoption: {
          ...item.graphoption,
          order: index,
        },
      }));
    });

    setChangeInState(true);
  };

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSave = () => {
    // Map each widget into the required structure for the API
    const updatedWidgets = dashboardContent.map((item) => ({
      id: item.id, // Widget ID
      database: currentDataSource, // The currently selected data source
      title: item.title,
      query: item.query,
      graphoption: item.graphoption, // Includes the updated order
      type: item.type, // e.g., "graph" or "metrics"
    }));

    updateDashboardApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: updatedWidgets,
    })
      .then(() => {
        toast.success("Dashboard saved successfully!");
        setChangeInState(false);
      })
      .catch((error) => {
        console.error("Error saving dashboard:", error);
        toast.error("Failed to save dashboard!");
      });
  };

  return (
    <>
      <ToastContainer />
      {/*Header */}
      <div>
        <div className="bg-light m-1 p-2 border rounded d-flex align-items-center flex-wrap">
          <div className="status d-flex align-items-center">
            {stateChange && (
              <>
                <FontAwesomeIcon
                  icon={faSave}
                  className="btn-green p-1 rounded"
                  onClick={handleSave}
                />
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
                  setSelectedDataSource(e.target.value);
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
