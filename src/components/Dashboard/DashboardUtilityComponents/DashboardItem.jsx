import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Line } from "react-chartjs-2";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css"; // Import default styles for react-resizable
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpDownLeftRight } from "@fortawesome/free-solid-svg-icons";

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

function DashboardItem({ id, title, query }) {
  const { attributes, setNodeRef, listeners, transform, transition } =
    useSortable({ id });

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

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} className="border rounded m-5 p-5" style={style}>
      {/* Drag handle (Icon) */}
      <div
        {...listeners} // Attach drag events to this icon only
        {...attributes}
        className="drag-handle"
        style={{
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <FontAwesomeIcon icon={faUpDownLeftRight} />
        <span>{title}</span>
        <span>{query}</span>
      </div>

      {/* Resizable Chart */}
      <ResizableBox
        width={600}
        height={400}
        minConstraints={[300, 200]} // Minimum width and height
        maxConstraints={[1200, 800]} // Maximum width and height
        resizeHandles={["se"]} // Handles for resizing
      >
        <Line data={sampleData} options={sampleOptions} />
      </ResizableBox>
    </div>
  );
}

export default DashboardItem;
