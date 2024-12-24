import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import createApiCall, { PUT } from "../../api/api";
import {
  faAlignCenter,
  faAlignLeft,
  faAlignRight,
  faAlignJustify,
  faUndo,
  faHeading,
  faFloppyDisk,
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
import { useState, useRef, useEffect } from "react";

function DashboardItem({
  id,
  title,
  query,
  graphOptions,
  dataSource,
  graphData,
}) {
  const { attributes, setNodeRef, listeners, transform, transition } =
    useSortable({ id });
  const [editWidgetModal, SetEditWidgetVisiblity] = useState(false);
  const [showSQL, setShowSQL] = useState(graphOptions.widgetSettings.viewQuery);
  const [graphHeight, setGraphHeight] = useState(
    graphOptions.widgetSettings.height
  );
  const [graphWidth, setGraphWidth] = useState(
    graphOptions.widgetSettings.width
  );
  const [widgetTitle, setWidgetTitle] = useState(title);
  const [alignment, setAlignment] = useState("");
  const [showNotes, setNotesVisiblity] = useState(false);
  const [notes, setNotes] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const isFirstRender = useRef(true);

  const updateWidgetApi = createApiCall("dashboardAnalytics", PUT);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (
      widgetTitle !== title ||
      graphHeight !== graphOptions.widgetSettings.height ||
      graphWidth !== graphOptions.widgetSettings.width ||
      showSQL !== graphOptions.widgetSettings.viewQuery
    ) {
      setUnsavedChanges(true);
    }
  }, [
    graphHeight,
    graphWidth,
    showSQL,
    showNotes,
    notes,
    alignment,
    widgetTitle,
  ]);

  const handleUpdateNewSettings = () => {
    const updatedWidgetSettings = {
      viewQuery: showSQL,
      height: graphHeight,
      width: graphWidth,
      viewNotes: showNotes,
      notesContent: notes,
    };

    // Return updated graphoption with new widget settings
    return {
      ...graphOptions,
      widgetSettings: {
        ...graphOptions.widgetSettings,
        ...updatedWidgetSettings,
      },
    };
  };

  const handleSaveWidget = async () => {
    const updatedData = handleUpdateNewSettings();
    const body = {
      id,
      database: dataSource,
      title: widgetTitle,
      query,
      graphoption: updatedData,
      type: "graph",
    };

    console.log(body);
    updateWidgetApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body,
    })
      .then((response) => {
        console.log("Widget saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving widget:", error);
      });
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Heading,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: `
    `,
    onUpdate: ({ editor }) => {
      setNotes(editor.getJSON());
    },
  });

  const renderGraph = () => {
    switch (graphOptions.graphType) {
      case "Line":
        return <Line data={graphData} options={graphOptions.options} />;
      case "Bar":
        return <Bar data={graphData} options={graphOptions.options} />;
      case "Bubble":
        return <Bubble data={graphData} options={graphOptions.options} />;
      case "Doughnut":
        return <Doughnut data={graphData} options={graphOptions.options} />;
      case "Pie":
        return <Pie data={graphData} options={graphOptions.options} />;
      case "PolarArea":
        return <PolarArea data={graphData} options={graphOptions.options} />;
      case "Radar":
        return <Radar data={graphData} options={graphOptions.options} />;
      case "Scatter":
        return <Scatter data={graphData} options={graphOptions.options} />;
      default:
        return <Line data={graphData} options={graphOptions.options} />;
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className="widget card shadow-sm bg-light rounded-3 mb-4 p-2"
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
            {widgetTitle}
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
          <FontAwesomeIcon
            icon={faFloppyDisk}
            className={`p-1 ms-1 ${
              unsavedChanges ? "btn btn-danger" : "btn-green"
            } p-1 rounded`}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title={
              unsavedChanges ? "Your changes are saved" : "Save the Widget"
            }
            style={{ cursor: unsavedChanges ? "pointer" : "not-allowed" }}
            onClick={(e) => {
              if (unsavedChanges) {
                handleSaveWidget();
              }
            }}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Draggable Title with Tooltip */}
          {showSQL && (
            <pre
              className="bg-white rounded p-1 mb-0 w-100"
              style={{
                fontSize: "0.9rem",
                overflowX: "auto",
              }}
            >
              <span className="ms-2">{query}</span>
            </pre>
          )}
        </div>
        {/* Query Output */}
        {/* Resizable Chart */}
        <div className={`${alignment}`}>
          <ResizableBox
            width={graphWidth}
            height={graphHeight}
            minConstraints={[300, 200]}
            maxConstraints={[1200, 800]}
            resizeHandles={["se"]}
            className="border rounded bg-white p-1"
            onResizeStop={(event, { size }) => {
              setGraphHeight(size.height);
              setGraphWidth(size.width);
            }}
          >
            {renderGraph()}
          </ResizableBox>
        </div>
        {/*  */}
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bubble-menu">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`btn-menu ${
                editor.isActive("bold") ? "is-active" : ""
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`btn-menu ${
                editor.isActive("italic") ? "is-active" : ""
              }`}
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`btn-menu ${
                editor.isActive("strike") ? "is-active" : ""
              }`}
            >
              Strike
            </button>
            <div className="button-group">
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className={`btn-menu ${
                  editor.isActive({ textAlign: "left" }) ? "is-active" : ""
                }`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Align Left"
              >
                <FontAwesomeIcon icon={faAlignLeft} />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                className={`btn-menu ${
                  editor.isActive({ textAlign: "center" }) ? "is-active" : ""
                }`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Align Center"
              >
                <FontAwesomeIcon icon={faAlignCenter} />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className={`btn-menu ${
                  editor.isActive({ textAlign: "right" }) ? "is-active" : ""
                }`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Align Right"
              >
                <FontAwesomeIcon icon={faAlignRight} />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                className={`btn-menu ${
                  editor.isActive({ textAlign: "justify" }) ? "is-active" : ""
                }`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Justify"
              >
                <FontAwesomeIcon icon={faAlignJustify} />
              </button>
            </div>
          </div>
        </BubbleMenu>
        {showNotes && <EditorContent editor={editor} />}
      </div>
      {editWidgetModal && (
        <>
          {/* Modal Backdrop */}
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

          {/* Modal Content */}
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-white rounded p-3">
                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FontAwesomeIcon
                      className="mx-2"
                      icon={faScrewdriverWrench}
                    />
                    Edit <span className="text-green">Dashboard Widget</span>
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

                {/* Modal Body */}
                <div className="modal-body">
                  {/* Title Input */}
                  <div className="mb-3 row">
                    <div className="col-6">Title</div>
                    <div className="col-6">
                      <input
                        type="text"
                        id="title-input"
                        className="form-control"
                        placeholder="Enter Title"
                        value={widgetTitle}
                        onChange={(e) => setWidgetTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="d-flex row justify-content-between align-items-center mb-3">
                    <div className="col-6">Graph Alignment</div>
                    <div className="col-6 mx-auto d-flex justify-content-between">
                      <button
                        className="btn-menu"
                        onClick={() => setAlignment("")}
                        title="Align Left"
                      >
                        <FontAwesomeIcon icon={faAlignLeft} />
                      </button>
                      <button
                        className="btn-menu"
                        onClick={() => setAlignment("mx-auto")}
                        title="Align Center"
                      >
                        <FontAwesomeIcon icon={faAlignCenter} />
                      </button>
                      <button
                        className="btn-menu"
                        onClick={() => setAlignment("ms-auto")}
                        title="Align Right"
                      >
                        <FontAwesomeIcon icon={faAlignRight} />
                      </button>
                    </div>
                  </div>
                  {/* Show SQL Query Checkbox */}
                  <div className=" mb-3 row">
                    <div className="col-6">
                      <label
                        htmlFor="show-sql-query"
                        className="form-check-label"
                      >
                        Show SQL Query
                      </label>
                    </div>
                    <div className="col-6">
                      <input
                        type="checkbox"
                        id="show-sql-query"
                        className="form-check-input"
                        onChange={(e) => setShowSQL(e.target.checked)}
                      />
                    </div>
                  </div>
                  {/* Show Notes Checkbox */}
                  <div className=" mb-3 row">
                    <div className="col-6">
                      <label
                        htmlFor="show-sql-query"
                        className="form-check-label"
                      >
                        Show Notes
                      </label>
                    </div>
                    <div className="col-6">
                      <input
                        type="checkbox"
                        id="show-sql-query"
                        className="form-check-input"
                        onChange={(e) => setNotesVisiblity(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                {/* <div className="modal-footer">
                </div> */}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default DashboardItem;
