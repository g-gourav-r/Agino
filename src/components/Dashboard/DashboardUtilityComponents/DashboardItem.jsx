import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faScrewdriverWrench,
  faUpDownLeftRight,
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
import { useState } from "react";

function DashboardItem({
  id,
  title,
  query,
  graphType,
  graphOptions,
  graphData,
}) {
  const [editWidgetModal, SetEditWidgetVisiblity] = useState(false);
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
    <>
      <div
        ref={setNodeRef}
        className="card shadow-sm rounded-3 mb-4 p-2"
        style={style}
      >
        {/* Card Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          {/* Draggable Title with Tooltip */}
          <h5
            {...listeners}
            {...attributes}
            style={{ cursor: "grab" }}
            aria-label="Drag to reorder"
            className="border rounded card-title text-center flex-grow-1 m-0 p-1"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Drag the card by the title"
          >
            {title}
          </h5>

          {/* Movable Icon */}
          <FontAwesomeIcon
            icon={faPencil}
            className="p-1 ms-1 btn-green p-1 rounded"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Edit the Widget"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              SetEditWidgetVisiblity(true);
            }}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Draggable Title with Tooltip */}
          <pre
            className="bg-dark text-white rounded p-2 mb-0 w-100"
            style={{
              fontSize: "0.9rem",
              overflowX: "auto",
            }}
          >
            {query}
          </pre>
        </div>
        {/* Query Output */}

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
      {editWidgetModal && (
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
                      icon={faScrewdriverWrench}
                    />{" "}
                    Edit <span className="text-green">Dashboard Widget</span>{" "}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      SetEditWidgetVisiblity(false);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="title-input" className="form-label">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title-input"
                      className="form-control"
                      placeholder="Enter Title"
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="show-sql-query"
                      className="form-check-input"
                    />
                    <label
                      htmlFor="show-sql-query"
                      className="form-check-label"
                    >
                      Show SQL Query
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className={`
                      btn-green
                    p-1 w-50 rounded`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default DashboardItem;
