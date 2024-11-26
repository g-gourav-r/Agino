import React, { useState } from "react";
// import {
//   Line,
//   Bar,
//   Bubble,
//   Doughnut,
//   Pie,
//   PolarArea,
//   Radar,
//   Scatter,
// } from "react-chartjs-2";
import createApiCall, { POST, GET } from "../../api/api.jsx";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   RadialLinearScale,
//   ArcElement,
// } from "chart.js";
import RotatingSquareLoader from "../../Loaders/RotatingSquare";
import { toast } from "react-toastify";

// Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   ArcElement,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   RadialLinearScale
// );

const getGraphData = createApiCall("graphData", POST);
const downloadReportApi = createApiCall("getSheet", GET);

const VisualizeData = ({ DB_response, ChatLogId, handleShare }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedFirstHeader, setSelectedFirstHeader] = useState("");
  const [selectedSecondHeader, setSelectedSecondHeader] = useState("");
  const [selectedSecondYHeader, setSelectedSecondYHeader] = useState(""); // New state for Y2 header
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphType, setGraphType] = useState("line");
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

  const handleGenerateGraph = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFirstHeader("");
    setSelectedSecondHeader("");
    setSelectedSecondYHeader(""); // Reset second Y header on close
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await downloadReportApi({
        urlParams: { chatLogId: ChatLogId },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Download response:", response);

      if (response && response.url) {
        window.open(response.url, "_blank");
      } else {
        console.error("No URL found in the response.");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const handleGenerateGraphSubmit = () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    // Conditionally build request data
    const requestData = {
      xaxis: selectedFirstHeader,
      yaxis1: selectedSecondHeader,
      chatLogId: ChatLogId,
    };

    // Include yaxis2 only if selected
    if (selectedSecondYHeader) {
      requestData.yaxis2 = selectedSecondYHeader;
    }

    getGraphData({
      body: requestData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const { data } = response;
        if (data && data.labels && data.datasets) {
          const hasValidData =
            data.labels.some((label) => label !== null) &&
            data.datasets.some((dataset) =>
              dataset.data.some((point) => point !== null)
            );

          if (hasValidData) {
            setGraphData(data);
          } else {
            toast.error("Cannot generate graph: No valid data returned.", {
              autoClose: 750,
            });
          }
        } else {
          toast.error("Error: Invalid data format returned from the API.", {
            autoClose: 750,
          });
        }
      })
      .catch((error) => {
        console.error("Error generating graph:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    handleCloseModal();
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Generated Graph",
      },
    },
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

  // New function to copy the table data
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
        toast.info("Table copied", { autoClose: 750 });
      })
      .catch((error) => {
        toast.error("Error copying Table data:", error);
      });
  };

  // const renderChart = (type) => {
  //   const chartOptions = {
  //     responsive: true,
  //     plugins: {
  //       legend: {
  //         position: "top",
  //         labels: {
  //           filter: (legendItem) => {
  //             // Exclude the second Y-axis dataset from the legend if it is not selected
  //             if (
  //               selectedSecondYHeader &&
  //               legendItem.text.includes(selectedSecondYHeader)
  //             ) {
  //               return true;
  //             }
  //             return !legendItem.text.includes(selectedSecondYHeader); // Exclude if it's tied to the second Y-axis
  //           },
  //         },
  //       },
  //       title: {
  //         display: true,
  //         text: "Generated Graph",
  //       },
  //     },
  //   };

  //   // Remove the second Y-axis dataset if it's not selected
  //   const filteredGraphData = {
  //     ...graphData,
  //     datasets: graphData.datasets.filter((dataset) => {
  //       if (selectedSecondYHeader) {
  //         return true; // Keep all datasets if second Y-axis is selected
  //       }
  //       // Exclude datasets that are associated with yaxis2
  //       return !dataset.yaxis2;
  //     }),
  //   };

  //   switch (type) {
  //     case "bar":
  //       return <Bar data={filteredGraphData} options={chartOptions} />;
  //     case "bubble":
  //       return <Bubble data={filteredGraphData} options={chartOptions} />;
  //     case "doughnut":
  //       return <Doughnut data={filteredGraphData} options={chartOptions} />;
  //     case "pie":
  //       return <Pie data={filteredGraphData} options={chartOptions} />;
  //     case "polarArea":
  //       return <PolarArea data={filteredGraphData} options={chartOptions} />;
  //     case "radar":
  //       return <Radar data={filteredGraphData} options={chartOptions} />;
  //     case "scatter":
  //       return <Scatter data={filteredGraphData} options={chartOptions} />;
  //     default:
  //       return <Line data={filteredGraphData} options={chartOptions} />;
  //   }
  // };

  return (
    <>
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
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link text-black"
                onClick={() => handlePageChange(1)}
                aria-label="First"
              >
                <span aria-hidden="true">&laquo;&laquo;</span>
              </button>
            </li>
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
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
    </>
  );
};

export default VisualizeData;
