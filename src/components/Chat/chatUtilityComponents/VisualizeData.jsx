import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  //
  //

  const [selectedX, setSelectedX] = useState("");
  const [selectedY1, setSelectedY1] = useState("");
  const [selectedY2, setSelectedY2] = useState("");

  // Handle selection changes
  const handleXChange = (e) => setSelectedX(e.target.value);
  const handleYChange1 = (e) => setSelectedY1(e.target.value);
  const handleYChange2 = (e) => setSelectedY2(e.target.value);

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

  // Sample data for the chart
  const data = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Dataset 1",
        data: [10, 20, 30, 40, 50],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        yAxisID: "y1", // Associated with y1 axis
      },
      {
        label: "Dataset 2",
        data: [15, 25, 35, 45, 55],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        yAxisID: "y2", // Associated with y2 axis
      },
    ],
  };

  // const options = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       display: showLegend,
  //       position: "right",
  //     },
  //     title: {
  //       display: false,
  //       text: "Dynamic Chart with Multiple Y Axes",
  //     },
  //   },
  //   scales: {
  //     x: {
  //       title: {
  //         display: true,
  //         text: xAxis,
  //       },
  //     },
  //     y1: {
  //       type: "linear",
  //       position: "left",
  //       title: {
  //         display: true,
  //         text: "Y1 Axis",
  //       },
  //     },
  //     y2: {
  //       type: "linear",
  //       position: "right",
  //       title: {
  //         display: true,
  //         text: "Y2 Axis",
  //       },
  //       grid: {
  //         drawOnChartArea: false, // Prevent grid lines overlapping with y1
  //       },
  //     },
  //   },
  // };

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

  return (
    <>
      <div className="row">
        <div className="col-10">
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
        <div className="col-2">
          {/* <hr className="mx-3" /> */}
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
      </div>
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
                <div className="row p-2 border d-flex flex-row justify-content-between">
                  {/* X-Axis Dropdown (on the left side) */}
                  <div className="d-flex flex-column align-items-start col-6">
                    <h3 className="py-2 text-center">X-axis</h3>
                    <div className="text-center">
                      <select
                        name="x-axis"
                        id="x-axis"
                        onChange={handleXChange}
                        value={selectedX}
                        className="btn-menu rounded"
                      >
                        <option value="">Select X-axis</option>
                        {headers.map((header, index) => (
                          <option key={index} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Y-Axis Dropdown (on the right side) */}
                  <div className="d-flex flex-column align-items-end col-6">
                    <h3 className="text-center py-2">Y-axis</h3>
                    <div>
                      <label htmlFor="y-axis">Parameter 1</label>
                      <select
                        name="y-axis"
                        id="y-axis"
                        onChange={handleYChange1}
                        value={selectedY1}
                        className="ms-2 btn-menu rounded"
                      >
                        <option value="" disabled>
                          Parameter 1
                        </option>
                        {headers.map((header, index) => (
                          <option key={index} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="y-axis">Parameter 2</label>
                      <select
                        name="y-axis"
                        id="y-axis"
                        onChange={handleYChange2}
                        value={selectedY2}
                        className="ms-2 btn-menu rounded"
                      >
                        <option value="" disabled>
                          Parameter 2
                        </option>
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
                <h1>footer</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisualizeData;
