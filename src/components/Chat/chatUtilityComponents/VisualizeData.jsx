import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import createApiCall, { POST, GET } from "../../api/api.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faCopy } from "@fortawesome/free-solid-svg-icons";

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
import Heading from "@tiptap/extension-heading";

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

const VisualizeData = ({ DB_response, ChatLogId, handleShare }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showGraphModal, setGraphModalVisiblity] = useState(false);
  const [graphType, setGraphType] = useState("Line");
  const [loading, setLoading] = useState(false);
  const [selectedX, setSelectedX] = useState("");
  const [selectedY1, setSelectedY1] = useState("");
  const [selectedY2, setSelectedY2] = useState("");
  const [graphValues, setGraphValues] = useState([]);
  const [showGraph, setShowGraph] = useState(false);

  // States for dynamic chart configurations
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState("top"); // Options: 'top', 'left', 'right', 'bottom'
  const [xTitle, setXTitle] = useState("");
  const [y1Title, setY1Title] = useState("");
  const [y2Title, setY2Title] = useState("");
  const [y1Position, setY1Position] = useState("left"); // Options: 'left', 'right'
  const [y2Position, setY2Position] = useState("right"); // Options: 'left', 'right'
  const [graphTitle, setGraphTitle] = useState("");

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  const rowsPerPage = 5;

  if (!DB_response || DB_response.length === 0) return null;

  const headers = Object.keys(DB_response[0]);
  const totalPages = Math.ceil(DB_response.length / rowsPerPage);
  const currentRows = DB_response.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
  const renderGraph = () => {
    switch (graphType) {
      case "Line":
        return <Line data={graphValues} />;
      case "Bar":
        return <Bar data={graphValues} />;
      case "Bubble":
        return <Bubble data={graphValues} />;
      case "Doughnut":
        return <Doughnut data={graphValues} />;
      case "Pie":
        return <Pie data={graphValues} />;
      case "PolarArea":
        return <PolarArea data={graphValues} />;
      case "Radar":
        return <Radar data={graphValues} />;
      case "Scatter":
        return <Scatter data={graphValues} />;
      default:
        return <Line data={graphValues} />; // Default to Line graph
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12 col-lg-10">
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
        <div className="col-12 col-lg-2">
          {/* Buttons */}
          <div className="visulize-data-btn-grp p-2">
            <button
              className="btn-green p-1 rounded w-100 m-2 text-start"
              onClick={handleCopyTable}
            >
              <FontAwesomeIcon className="mx-2" icon={faCopy} /> Copy Table
            </button>
            <button
              className="btn-green p-1 rounded w-100 m-2 text-start"
              onClick={() => {
                setGraphModalVisiblity(true);
              }}
            >
              <FontAwesomeIcon className="mx-2" icon={faChartLine} /> Generate
              Graph
            </button>
          </div>
        </div>
      </div>{" "}
      {showGraph && (
        <>
          <div className="btns-grp">
            <div className="col-2 p-2">
              <div className="form-group">
                <label htmlFor="graphType">Select Graph Type:</label>
                <select
                  id="graphType"
                  className="btn-menu"
                  value={graphType}
                  onChange={handleGraphTypeChange}
                >
                  <option value="Line">Line</option>
                  <option value="Bar">Bar</option>
                  <option value="Bubble">Bubble</option>
                  <option value="Doughnut">Doughnut</option>
                  <option value="Pie">Pie</option>
                  <option value="PolarArea">Polar Area</option>
                  <option value="Radar">Radar</option>
                  <option value="Scatter">Scatter</option>
                </select>
              </div>
              <div>
                <button onClick={handleCopyGraph}>Copy graph</button>
              </div>
            </div>
          </div>
          <div className="rounded chart-container p-2 border">
            <div
              id="graph-container"
              className="p-1 d-flex align-items-center justify-content-center"
            >
              <div className="mt-4 w-100">{renderGraph(graphType)}</div>
            </div>{" "}
          </div>
          <div className="">
            {" "}
            <div className="container mt-4">
              <div className="row">
                {/* Show Legend and Legend Position */}
                <div className="col-12 col-md-3 mb-3">
                  <label className="me-2">Show Legend:</label>
                  <select
                    value={showLegend ? "true" : "false"} // Display 'true' or 'false' based on the showLegend state
                    onChange={handleShowLegendChange} // Update the state with boolean value
                    className="form-select"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>

                  <div className="mt-2">
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

                {/* X Axis Title and Y1 Axis Title */}
                <div className="col-12 col-md-3 mb-3">
                  <div className="mb-2">
                    <label>X Axis Title:</label>
                    <input
                      type="text"
                      value={xTitle}
                      onChange={(e) => setXTitle(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-2">
                    <label>Y1 Axis Title:</label>
                    <input
                      type="text"
                      value={y1Title}
                      onChange={(e) => setY1Title(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Y2 Axis Title and Y1 Axis Position */}
                <div className="col-12 col-md-3 mb-3">
                  <div className="mb-2">
                    <label>Y2 Axis Title:</label>
                    <input
                      type="text"
                      value={y2Title}
                      onChange={(e) => setY2Title(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-2">
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

                {/* Y2 Axis Position and Graph Title */}
                <div className="col-12 col-md-3 mb-3">
                  <div className="mb-2">
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
                  <div className="mb-2">
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
            </div>
          </div>
        </>
      )}
      {showGraphModal && (
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
          </div>
        </div>
      )}
    </>
  );
};

export default VisualizeData;
