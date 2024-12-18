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
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import { toast } from "react-toastify";

function DashboardMainContent() {
  const [dataSources, setDataSources] = useState();
  const [loading, setLoading] = useState(false);
  const [currentDataSource, setCurrentDataSource] = useState("");
  const [dashboardContent, setDashboardContent] = useState({});

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
    setDashboardContent({});
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
        setDashboardContent(response.data);
        toast.info(response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching dashboard data:", error);
      });
  };

  const [tasks, setTasks] = useState([
    { id: 1, title: "Add tests 1" },
    { id: 2, title: "Add tests 2" },
    { id: 3, title: "Add tests 3" },
  ]);

  const getTaskPos = (id) => tasks.findIndex((task) => task.id === id);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id === over.id) return;

    setTasks((tasks) => {
      const originalPos = getTaskPos(active.id);
      const newPos = getTaskPos(over.id);

      return arrayMove(tasks, originalPos, newPos);
    });
  };

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <>
      {/*Header */}
      <div>
        <div className="bg-light m-1 p-2 border rounded d-flex align-items-center flex-wrap">
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
            <DashboardColumns tasks={tasks} />
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
