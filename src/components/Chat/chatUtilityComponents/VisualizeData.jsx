import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import createApiCall, { POST, GET } from "../../api/api.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCopy,
  faGear,
  faExpand,
  faCompress,
  faTachographDigital,
  faPlusCircle,
  faDownload,
  faFileDownload,
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";

import {
  Line,
  Bar,
  Bubble,
  Doughnut,
  Pie,
  PolarArea,
  Radar,
  Scatter,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
} from "chart.js";
import RotatingSquareLoader from "../../Loaders/RotatingSquare";
import MutatingDotsLoader from "../../Loaders/MutatingDots.jsx";

ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const getGraphData = createApiCall("graphData", POST);
const downloadReportApi = createApiCall("getSheet", GET);
const addToDashboardApi = createApiCall("dashboardAnalytics", POST);

const VisualizeData = ({ DB_response, ChatLogId, query }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showGraphModal, setGraphModalVisiblity] = useState(false);
  const [graphType, setGraphType] = useState("Line");
  const [loading, setLoading] = useState(false);
  const [selectedX, setSelectedX] = useState("");
  const [selectedY1, setSelectedY1] = useState("");
  const [selectedY2, setSelectedY2] = useState("");
  const [graphValues, setGraphValues] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [showGraphSettings, setGraphSettingsVisiblity] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState("");

  // States for dynamic chart configurations
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState("top"); // Options: 'top', 'left', 'right', 'bottom'
  const [xTitle, setXTitle] = useState("");
  const [y1Title, setY1Title] = useState("");
  const [y2Title, setY2Title] = useState("");
  const [y1Position, setY1Position] = useState("left"); // Options: 'left', 'right'
  const [y2Position, setY2Position] = useState("right"); // Options: 'left', 'right'
  const [graphTitle, setGraphTitle] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showDashboardModal, setDashboardModalVisiblity] = useState(false);
  const graphContainerRef = useRef(null);
  const [ableToGenerateGraph, setGraphGenerationAbility] = useState(false);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;
  const selectedDataSource = appData?.chatData?.selectedDataSource;

  const rowsPerPage = 5;

  if (!DB_response || DB_response.length === 0) return null;

  const headers = Object.keys(DB_response[0]);
  const totalPages = Math.ceil(DB_response.length / rowsPerPage);
  const currentRows = DB_response.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    if (headers.length >= 2 && currentRows.length > 2) {
      setGraphGenerationAbility(true);
    }
  }, []);

  const scrollableContainerStyle = {
    overflowX: "auto",
    width: "100%",
    marginTop: "1rem",
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleGraphTypeChange = (e) => {
    setGraphType(e.target.value);
  };

  //Copy Graph Button
  const handleCopyGraph = () => {
    const canvas = document.querySelector("#graph-container canvas");
    if (!canvas) {
      alert("Canvas element not found!");
      return;
    }

    // Convert the canvas to a blob and copy it to clipboard
    canvas.toBlob((blob) => {
      if (blob) {
        navigator.clipboard
          .write([new ClipboardItem({ [blob.type]: blob })])
          .then(() => {
            toast.info("Graph copied to clipboard!", { autoClose: 750 });
          })
          .catch((err) => {
            console.error("Failed to write to clipboard: ", err);
            toast.error("Failed to copy the graph to clipboard.", {
              autoClose: 750,
            });
          });
      } else {
        toast.error("Failed to create a blob from the canvas.", {
          autoClose: 750,
        });
      }
    });
  };

  // Sample Data for graph
  const sampleData = {
    labels: ["January", "February", "March", "April", "May"], // x-axis labels
    datasets: [
      {
        label: "Y1 Parameter", // Dataset for Y1
        data: [1200, 1900, 800, 1500, 2000],
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        yAxisID: "y1", // Linked to the y1 axis
      },
      {
        label: "Y2 Parameter", // Dataset for Y2
        data: [20, 25, 15, 30, 35],
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Bar color
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        yAxisID: "y2", // Linked to the y2 axis
      },
    ],
  };

  // Sample Options
  const sampleOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "X axis", // Label for Y1
        },
      },
      y1: {
        type: "linear", // First Y-axis is linear
        position: "left",
        title: {
          display: true,
          text: "Y1 Parameter", // Label for Y1
        },
      },
      y2: {
        type: "linear", // Second Y-axis is linear
        position: "right",
        title: {
          display: true,
          text: "Y2 Parameter", // Label for Y2
        },
        grid: {
          drawOnChartArea: false, // Prevent grid lines overlapping with Y1
        },
        ticks: {
          callback: (value) => `${value}%`, // Add % to ticks
        },
      },
    },
  };

  // Dynamic options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: graphTitle,
      },
      legend: showLegend
        ? {
            position: legendPosition,
          }
        : false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xTitle,
        },
      },
      y1: {
        type: "linear",
        position: y1Position,
        title: {
          display: true,
          text: y1Title,
        },
      },
      ...(selectedY2 && {
        y2: {
          type: "linear",
          position: y2Position,
          title: {
            display: true,
            text: y2Title,
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            callback: (value) => `${value}%`,
          },
        },
      }),
    },
  };

  // Function to copy Table
  const handleCopyTable = () => {
    // Create the HTML table string
    const tableHTML = `
      <table>
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${currentRows
            .map(
              (row) =>
                `<tr>${headers
                  .map((header) => `<td>${row[header]}</td>`)
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    // Use the Clipboard API to copy HTML content
    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": new Blob([tableHTML], { type: "text/html" }),
          "text/plain": new Blob([tableHTML], { type: "text/plain" }),
        }),
      ])
      .then(() => {
        toast.info("Table copied as HTML", { autoClose: 750 });
      })
      .catch((error) => {
        toast.error("Error copying Table data:", error);
      });
  };

  // Show Legend
  const handleShowLegendChange = (e) => {
    setShowLegend(e.target.value === "true"); // Convert the string value to a boolean
  };

  // Function to fetch the graph details
  const handleGenerateGraph = () => {
    if (
      selectedX === selectedY1 ||
      selectedX === selectedY2 ||
      selectedY1 === selectedY2
    ) {
      toast.error("Select unique parameters", { autoClose: 800 });
      return;
    } else {
      setLoading(true);
      getGraphData({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          xaxis: selectedX,
          yaxis1: selectedY1,
          yaxis2: selectedY2,
          chatLogId: ChatLogId,
        },
      })
        .then((response) => {
          setGraphValues(response.data);
          setLoading(false);
          setGraphModalVisiblity(false);
          setShowGraph(true);
        })
        .catch((error) => {
          setLoading(false);
          toast.error("Failed to create graph, try again");
          console.error(`API fetch failed, ${error}`);
        });
    }
  };

  // Function to render the graph
  const renderGraph = () => {
    switch (graphType) {
      case "Line":
        return <Line data={graphValues} options={options} />;
      case "Bar":
        return <Bar data={graphValues} options={options} />;
      case "Bubble":
        return <Bubble data={graphValues} options={options} />;
      case "Doughnut":
        return <Doughnut data={graphValues} options={options} />;
      case "Pie":
        return <Pie data={graphValues} options={options} />;
      case "PolarArea":
        return <PolarArea data={graphValues} options={options} />;
      case "Radar":
        return <Radar data={graphValues} options={options} />;
      case "Scatter":
        return <Scatter data={graphValues} options={options} />;
      default:
        return <Line data={graphValues} options={options} />; // Default to Line graph
    }
  };

  // Handle Add to Dashboard
  const handleAddToDashboard = () => {
    if (!dashboardTitle) {
      toast.error("Please add the title", { autoClose: 1000 });
      return;
    }

    setLoading(true);
    // Initialize a loading toast
    const addToDashboardToast = toast.loading("Adding to Dashboard...");
    addToDashboardApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        database: selectedDataSource,
        query: query,
        title: dashboardTitle,
        type: "graph",
        graphoption: {
          order: -1,
          coOrdinate: {
            X: selectedX,
            Y1: selectedY1,
            Y2: selectedY2,
          },
          graphType: graphType,
          options: options,
          widgetSettings: {
            viewQuery: false,
            height: 420,
            width: 842,
            viewNotes: false,
            notesContent: {},
          },
        },
      },
    })
      .then((response) => {
        setLoading(false);
        // Update the toast to show success
        toast.update(addToDashboardToast, {
          render: "Added to dashboard successfully",
          autoClose: 1000,
          type: "success",
          isLoading: false,
        });
        setDashboardModalVisiblity(false);
      })
      .catch((error) => {
        setLoading(false);
        // Update the toast to show an error
        toast.update(addToDashboardToast, {
          render: "Failed to create graph, try again",
          autoClose: 1000,
          type: "error",
          isLoading: false,
        });
        console.error(`API fetch failed, ${error}`);
        setDashboardModalVisiblity(false);
      });
  };

  const handleDownloadTable = () => {
    const downloadingFileToast = toast.loading("Downloading the file...");

    downloadReportApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      urlParams: {
        chatLogId: ChatLogId,
      },
    })
      .then((response) => {
        toast.update(downloadingFileToast, {
          render: (
            <>
              <div className="d-flex">
                <input
                  className="form-control"
                  type="text"
                  readOnly
                  value={response.url}
                />
                <div className="d-flex mx-2">
                  <a href={response.url} download>
                    <button
                      className="btn-green rounded d-flex align-items-center"
                      style={{ marginRight: "10px", height: "100%" }}
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Download File"
                    >
                      <FontAwesomeIcon icon={faFileDownload}></FontAwesomeIcon>
                    </button>
                  </a>
                  <button
                    className="btn-green rounded d-flex align-items-center"
                    onClick={() => copyToClipboard(response.url)}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Copy to Clipboard"
                    style={{ height: "100%" }}
                  >
                    <FontAwesomeIcon icon={faClipboard}></FontAwesomeIcon>
                  </button>
                </div>
              </div>
            </>
          ),
          type: "success",
          isLoading: false,
          autoClose: false,
          closeButton: true,
        });
      })
      .catch((error) => {
        toast.update(downloadingFileToast, {
          render: "File download failed, try again",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        console.error("Failed to Download : ", error);
      });
  };

  const copyToClipboard = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("URL copied to clipboard!", {
          autoClose: 3000,
        });
      })
      .catch((err) => {
        toast.error("Failed to copy URL", {
          autoClose: 3000,
        });
      });
  };

  return (
    <>
      <div>
        <div style={scrollableContainerStyle}>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                {headers.map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <tr key={index}>
                  {headers.map((key) => (
                    <td key={key}>{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mt-3">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link text-black"
                  onClick={() => handlePageChange(1)}
                  aria-label="First"
                >
                  <span aria-hidden="true">&laquo;&laquo;</span>
                </button>
              </li>
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link text-black"
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Previous"
                >
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link text-black"
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="Next"
                >
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link text-black"
                  onClick={() => handlePageChange(totalPages)}
                  aria-label="Last"
                >
                  <span aria-hidden="true">&raquo;&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
      {/* Buttons */}
      <div className="visulize-data-btn-grp p-2">
        <button
          className="btn-green p-1 rounded m-2 text-start"
          onClick={handleCopyTable}
        >
          <FontAwesomeIcon className="mx-2" icon={faCopy} /> Copy Table
        </button>
        <button
          className="btn-green p-1 rounded m-2 text-start"
          onClick={handleDownloadTable}
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          title="Download or share the sheet as an XLSX file"
        >
          <FontAwesomeIcon className="mx-2" icon={faDownload} /> Download Table
        </button>

        <button
          className={`${
            ableToGenerateGraph ? "btn-green" : "btn-green-disabled-tooltip"
          } p-1 rounded m-2 text-start`}
          onClick={() => {
            setGraphModalVisiblity(true);
          }}
          disabled={!ableToGenerateGraph}
          data-bs-toggle={!ableToGenerateGraph ? "tooltip" : undefined}
          data-bs-placement="bottom"
          title={
            !ableToGenerateGraph
              ? "Insufficient Data to Generate Graph"
              : undefined
          }
        >
          <FontAwesomeIcon className="mx-2" icon={faChartLine} />{" "}
          {showGraph ? "Regenerate" : "Generate"} Graph
        </button>

        {showGraph && (
          <>
            <select
              id="graphType"
              className="btn-green p-1 rounded m-2 text-start"
              value={graphType}
              onChange={handleGraphTypeChange}
            >
              <option value="Line">Line Chart</option>
              <option value="Bar">Bar Chart</option>
              <option value="Bubble">Bubble Chart</option>
              <option value="Doughnut">Doughnut Chart</option>
              <option value="Pie">Pie Chart</option>
              <option value="PolarArea">Polar Area Chart</option>
              <option value="Radar">Radar Chart</option>
              <option value="Scatter">Scatter Chart</option>
            </select>

            <button
              className="btn-green p-1 rounded m-2 text-start"
              onClick={handleCopyGraph}
            >
              <FontAwesomeIcon className="mx-2" icon={faCopy} /> Copy Graph
            </button>
            <button
              className="btn-green p-1 rounded m-2 text-start"
              onClick={() => setGraphSettingsVisiblity(true)}
            >
              <FontAwesomeIcon icon={faGear} /> Graph Settings
            </button>
            <button
              className={`${
                selectedDataSource ? "btn-green" : "btn-green-disabled-tooltip"
              } p-1 rounded m-2 text-start`}
              disabled={!selectedDataSource}
              data-bs-toggle={!selectedDataSource ? "tooltip" : undefined}
              data-bs-placement="bottom"
              title={
                !selectedDataSource
                  ? "Chat histories are read-only. Start a new chat to add to the dashboard"
                  : undefined
              }
              onClick={() => setDashboardModalVisiblity(true)}
            >
              <FontAwesomeIcon icon={faPlusCircle} /> Add to Dashboard
            </button>

            <button
              className="btn-green p-1 rounded m-2 text-start"
              onClick={() => setIsModalVisible(true)}
            >
              <FontAwesomeIcon className="mx-2" icon={faExpand} />
            </button>
          </>
        )}
      </div>

      {showGraph && (
        <>
          <div className="btns-grp">
            <div className="col-2 p-2"></div>
          </div>
          <div className="rounded chart-container p-2 border w-100">
            <div
              id="graph-container"
              className="p-1 d-flex align-items-center justify-content-center"
              ref={graphContainerRef}
              style={{
                maxWidth: "800px",
                width: "100%",
                margin: "0 auto",
              }}
            >
              <div className="mt-4 w-100" style={{ maxHeight: "400px" }}>
                {renderGraph(graphType)}{" "}
                {/* This function renders your chart */}
              </div>
            </div>
          </div>
          <div
            className={`modal fade ${isModalVisible ? "show d-block" : ""}`}
            tabIndex="-1"
            role="dialog"
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen w-100 h-100"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <button
                    type="button"
                    className="ms-auto btn-green p-1 rounded m-2 text-start"
                    aria-label="Close"
                    onClick={() => {
                      setIsModalVisible(false);
                    }}
                  >
                    <FontAwesomeIcon className="mx-2" icon={faCompress} /> Exit
                    Fullscreen
                  </button>
                </div>
                <div className="mx-auto modal-body w-100 h-100">
                  <div
                    style={{
                      maxWidth: "100%", // Make the modal dialog take full width
                      height: "80vh", // Make the modal dialog take full height
                    }}
                  >
                    {renderGraph(graphType)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {showGraphModal && (
        <>
          <div
            className="modal-backdrop opacity-50 rounded"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              {loading ? (
                <MutatingDotsLoader />
              ) : (
                <div className="modal-content bg-white rounded p-2">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <FontAwesomeIcon className="mx-2" icon={faChartLine} />{" "}
                      Generate <span className="text-green">Graph</span>{" "}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => {
                        setGraphModalVisiblity(false);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>
                      Select the <span className="text-green">parameters</span>
                    </p>
                    <Line data={sampleData} options={sampleOptions} />
                    <div className="row p-2 border rounded d-flex flex-row justify-content-between">
                      {/* X-Axis Dropdown (on the left side) */}
                      <div className="d-flex justify-content-between align-items-center p-2">
                        <label htmlFor="x-axis">X parameter</label>
                        <div className="">
                          <select
                            name="x-axis"
                            id="x-axis"
                            onChange={(e) => setSelectedX(e.target.value)}
                            value={selectedX}
                            className="btn-menu rounded"
                          >
                            <option value="" disabled>
                              Select a parameter
                            </option>
                            {headers.map((header, index) => (
                              <option key={index} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Y-Axis Dropdown (on the right side) */}
                      <div className="d-flex justify-content-between align-items-center p-2">
                        <label htmlFor="y-axis">Y1 parameter</label>
                        <div>
                          <select
                            name="y-axis"
                            id="y-axis"
                            onChange={(e) => setSelectedY1(e.target.value)}
                            value={selectedY1}
                            className="ms-2 btn-menu rounded"
                          >
                            <option value="" disabled>
                              Select a parameter
                            </option>
                            {headers.map((header, index) => (
                              <option key={index} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Y2 parameter */}
                      <div className="d-flex justify-content-between align-items-center p-2">
                        <label htmlFor="y-axis">Y2 Parameter</label>
                        <div>
                          <select
                            name="y-axis"
                            id="y-axis"
                            onChange={(e) => setSelectedY2(e.target.value)}
                            value={selectedY2}
                            className="btn-menu rounded"
                          >
                            <option value="">Select a parameter</option>
                            {headers.map((header, index) => (
                              <option key={index} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className={`${
                        loading ? "btn-green-disabled" : "btn-green"
                      } p-1 w-25 rounded`}
                      onClick={handleGenerateGraph}
                    >
                      Generate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {showGraphSettings && (
        <>
          <div
            className="modal-backdrop opacity-50 rounded"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></div>
          <div className="modal show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-white rounded p-2">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FontAwesomeIcon className="mx-2" icon={faChartLine} />{" "}
                    Generate <span className="text-green">Graph</span>{" "}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      setGraphSettingsVisiblity(false);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Select the <span className="text-green">parameters</span>
                  </p>

                  <div className="row">
                    <div className="col-6">
                      <label className="me-2">Show Legend:</label>
                      <select
                        value={showLegend ? "true" : "false"} // Display 'true' or 'false' based on the showLegend state
                        onChange={handleShowLegendChange} // Update the state with boolean value
                        className="form-select"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label>Legend Position:</label>
                      <select
                        value={legendPosition}
                        onChange={(e) => setLegendPosition(e.target.value)}
                        className="form-select btn-menu"
                      >
                        <option value="top">Top</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    {/* X Axis Title and Y1 Axis Title */}

                    <div className="col-6">
                      <label>X Axis Title:</label>
                      <input
                        type="text"
                        value={xTitle}
                        onChange={(e) => setXTitle(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="col-6">
                      <label>Y1 Axis Title:</label>
                      <input
                        type="text"
                        value={y1Title}
                        onChange={(e) => setY1Title(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="row">
                    {/* Y2 Axis Title and Y1 Axis Position */}
                    <div className="col-6">
                      <label>Y2 Axis Title:</label>
                      <input
                        type="text"
                        value={y2Title}
                        onChange={(e) => setY2Title(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="col-6">
                      <label>Y1 Axis Position:</label>
                      <select
                        value={y1Position}
                        onChange={(e) => setY1Position(e.target.value)}
                        className="form-select"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    {/* Y2 Axis Position and Graph Title */}

                    <div className="col-6">
                      <label>Y2 Axis Position:</label>
                      <select
                        value={y2Position}
                        onChange={(e) => setY2Position(e.target.value)}
                        className="form-select"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label>Graph Title:</label>
                      <input
                        type="text"
                        value={graphTitle}
                        onChange={(e) => setGraphTitle(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className={`${
                      loading ? "btn-green-disabled" : "btn-green"
                    } p-1 w-25 rounded`}
                    onClick={() => {
                      setGraphSettingsVisiblity(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {showDashboardModal && (
        <>
          <div
            className="modal-backdrop opacity-50 rounded"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-white rounded p-2">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FontAwesomeIcon
                      className="mx-2"
                      icon={faTachographDigital}
                    />{" "}
                    Add to <span className="text-green">Dashboard</span>{" "}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      setDashboardModalVisiblity(false);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    name=""
                    className="form-control"
                    placeholder="Title"
                    id=""
                    onChange={(e) => setDashboardTitle(e.target.value)}
                  />
                  <div className="text-center mt-4">
                    <small>Preview</small>
                    {renderGraph(graphType)}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className={`${
                      loading ? "btn-green-disabled" : "btn-green"
                    } p-1 w-50 rounded`}
                    onClick={handleAddToDashboard}
                  >
                    Add to dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default VisualizeData;
