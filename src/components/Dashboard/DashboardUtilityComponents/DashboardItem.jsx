import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
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

function DashboardItem({
  id,
  title,
  query,
  graphType,
  graphOptions,
  graphData,
}) {
  const { attributes, setNodeRef, listeners, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const renderGraph = () => {
    switch (graphType) {
      case "Line":
        return <Line data={graphData} options={graphOptions} />;
      case "Bar":
        return <Bar data={graphData} options={graphOptions} />;
      case "Bubble":
        return <Bubble data={graphData} options={graphOptions} />;
      case "Doughnut":
        return <Doughnut data={graphData} options={graphOptions} />;
      case "Pie":
        return <Pie data={graphData} options={graphOptions} />;
      case "PolarArea":
        return <PolarArea data={graphData} options={graphOptions} />;
      case "Radar":
        return <Radar data={graphData} options={graphOptions} />;
      case "Scatter":
        return <Scatter data={graphData} options={graphOptions} />;
      default:
        return <Line data={graphData} options={graphOptions} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="card shadow-sm rounded-3 mb-4 p-4"
      style={style}
    >
      {/* Card Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Draggable Title with Tooltip */}
        <h5
          {...listeners}
          {...attributes}
          style={{ cursor: "grab" }}
          aria-label="Drag to reorder"
          className="border card-title text-center flex-grow-1 m-0 p-2"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Drag the card by the title"
        >
          {title}
        </h5>

        {/* Movable Icon */}
        <FontAwesomeIcon
          icon={faUpDownLeftRight}
          style={{ cursor: "grab", marginLeft: "10px" }}
          {...listeners}
          {...attributes}
        />
      </div>

      {/* Query Output */}
      <pre
        className="bg-dark text-white rounded p-3 mb-3"
        style={{
          fontSize: "0.9rem",
          overflowX: "auto",
        }}
      >
        {query}
      </pre>

      {/* Resizable Chart */}
      <ResizableBox
        width={600}
        height={400}
        minConstraints={[300, 200]}
        maxConstraints={[1200, 800]}
        resizeHandles={["se"]}
        className="border rounded"
      >
        {renderGraph()}
      </ResizableBox>
    </div>
  );
}

export default DashboardItem;
