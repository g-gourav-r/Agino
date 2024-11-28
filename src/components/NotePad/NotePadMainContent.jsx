import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faStrikethrough,
  faCode,
  faParagraph,
  faListUl,
  faListOl,
  faCodeBranch,
  faQuoteLeft,
  faGripLines,
  faFileAlt,
  faUndo,
  faRedo,
  faHighlighter,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faTable,
  faPlus,
  faMinus,
  faTrash,
  faArrowUp,
  faArrowDown,
  faSave,
  faShareNodes,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
// Tiptap imports
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import Gapcursor from "@tiptap/extension-gapcursor";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import FileHandler from "@tiptap-pro/extension-file-handler";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import Dropcursor from "@tiptap/extension-dropcursor";
import { ToastContainer, toast } from "react-toastify";
import createApiCall, { GET, POST, PUT } from "../api/api";
import MutatingDotsLoader from "../Loaders/MutatingDots";

function NotePadMainContent({ setRefresh, noteID }) {
  const [title, setTitle] = useState("");
  const [notesData, setNotesData] = useState({});
  const [loading, setLoading] = useState(false);

  const saveNotesAPI = createApiCall("api/notes", POST);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  useEffect(() => {
    if (!noteID) return;

    setLoading(true);

    if (noteID === "new_note") {
      setTitle("");
      editor.commands.setContent("");
      const appData = JSON.parse(localStorage.getItem("appData"));
      const updatedAppData = {
        ...appData,
        notes: {
          ...appData.notes,
          notesID: "",
        },
      };
      localStorage.setItem("appData", JSON.stringify(updatedAppData));
      setLoading(false);
      toast.info("A new note has been created!", { autoClose: 200 });
    } else {
      const fetchNotesAPI = createApiCall(`api/notes/${noteID}`);

      fetchNotesAPI({
        urlParams: { noteID: noteID },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          editor.commands.setContent(JSON.parse(response.data.content));
          setTitle(response.data.title);
          setLoading(false);
          const appData = JSON.parse(localStorage.getItem("appData"));
          const updatedAppData = {
            ...appData,
            notes: {
              ...appData.notes,
              notesID: response.data._id,
            },
          };
          localStorage.setItem("appData", JSON.stringify(updatedAppData));
        })
        .catch((error) => {
          setLoading(false);
          toast.error("Failed to load the note.");
          console.error(error);
        });
    }
  }, [noteID]);

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Document,
      Paragraph,
      Text,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Gapcursor,
      ImageResize,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Dropcursor,
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ],
        onDrop: (currentEditor, files, pos) => {
          files.forEach((file) => {
            const fileReader = new FileReader();

            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: "image",
                  attrs: {
                    src: fileReader.result, // Base64 string
                  },
                })
                .focus()
                .run();
            };
          });
        },
        onPaste: (currentEditor, files, htmlContent) => {
          files.forEach((file) => {
            // Ensure it's an image
            if (!file.type.startsWith("image/")) return;

            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: "image",
                  attrs: {
                    src: fileReader.result, // Base64 string
                  },
                })
                .focus()
                .run();
            };
          });
        },
      }),
    ],
    content: ``,
    onUpdate: ({ editor }) => {
      setNotesData(editor.getJSON());
    },
  });

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDownload = () => {
    handleSave();
    if (title.trim().length < 1) {
      toast.error("Please provide a title before downloading.", {
        autoClose: 2000,
      });
    }
    const content = editor
      .getHTML()
      .replace(/<table/g, '<table class="table-pdf"');
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = content;
    document.body.appendChild(tempContainer);

    const options = {
      margin: 1,
      filename: title,
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
    };

    html2pdf()
      .from(tempContainer)
      .set(options)
      .save()
      .then(() => {
        document.body.removeChild(tempContainer);
      });
  };

  const handleSave = () => {
    if (title.trim().length < 1) {
      toast.error("Title is required to save your work.", { autoClose: 2000 });
      return;
    }

    const appData = JSON.parse(localStorage.getItem("appData"));
    const noteID = appData.notes?.notesID || "";

    if (noteID.trim().length < 1) {
      const saveNotesToast = toast.loading("Saving your note...");

      saveNotesAPI({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          title: title,
          content: JSON.stringify(notesData),
        },
      })
        .then((response) => {
          toast.update(saveNotesToast, {
            render: "Note saved successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });

          const appData = JSON.parse(localStorage.getItem("appData"));
          const updatedAppData = {
            ...appData,
            notes: {
              ...appData.notes,
              notesID: response.data._id,
            },
          };
          localStorage.setItem("appData", JSON.stringify(updatedAppData));
          setRefresh((prev) => !prev);

          setLoading(false);
        })
        .catch((error) => {
          toast.update(saveNotesToast, {
            render: "Failed to save note. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });

          console.error("Error saving note:", error);
          setLoading(false);
        });
    } else {
      const updateNoteApi = createApiCall(`api/notes/${noteID}`, PUT);
      const updateNotesToast = toast.loading("Saving your note...");

      updateNoteApi({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          title: title,
          content: JSON.stringify(notesData),
        },
      })
        .then((response) => {
          toast.update(updateNotesToast, {
            render: "Notes updated successfully",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          setRefresh((prev) => !prev);
        })
        .catch((error) => {
          console.error("Error updating note:", error);
          toast.update(updateNotesToast, {
            render: "Failed to update the note. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        });
    }
  };

  const handleShare = () => {
    if (title.trim().length < 1) {
      toast.error("A title is needed before sharing.", { autoClose: 2000 });
    }
  };

  return (
    <div className="d-flex flex-grow-1 flex-column h-100">
      <ToastContainer />
      {loading ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <MutatingDotsLoader />
        </div>
      ) : (
        <>
          <div className="notepad-header d-flex mx-2 mt-2 align-items-center">
            <input
              type="text"
              placeholder="Title"
              className="form-control me-2 flex-grow-1"
              value={title}
              onChange={handleTitleChange}
            />
            <div className="d-flex">
              <button
                type="button"
                className="btn-green d-flex p-2 rounded align-items-center me-2"
                onClick={handleSave}
              >
                <FontAwesomeIcon icon={faSave} />
              </button>
              <button
                type="button"
                className="btn-green d-flex p-2 rounded align-items-center me-2"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShareNodes} />
              </button>
              <button
                type="button"
                className="btn-green d-flex p-2 rounded align-items-center"
                onClick={handleDownload}
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
            </div>
          </div>
          <div className="control-group border bg-white m-1 rounded px-3">
            <div
              className="button-group-wrapper overflow-x-auto d-flex py-1"
              style={{ whiteSpace: "nowrap" }}
            >
              <div className="button-group d-inline-flex">
                {/* Text Formatting Buttons */}
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                  className={`btn-menu${
                    editor.isActive("bold") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faBold} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  className={`btn-menu ${
                    editor.isActive("italic") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faItalic} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  disabled={!editor.can().chain().focus().toggleStrike().run()}
                  className={`btn-menu ${
                    editor.isActive("strike") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faStrikethrough} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  disabled={!editor.can().chain().focus().toggleCode().run()}
                  className={`btn-menu ${
                    editor.isActive("code") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faCode} />
                </button>
                <button
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className={`btn-menu ${
                    editor.isActive("paragraph") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faParagraph} />
                </button>
                {[...Array(6)].map((_, i) => (
                  <button
                    key={`heading-${i + 1}`}
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHeading({ level: i + 1 })
                        .run()
                    }
                    className={`btn-menu ${
                      editor.isActive("heading", { level: i + 1 })
                        ? "is-active"
                        : ""
                    }`}
                  >
                    H{i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={`btn-menu ${
                    editor.isActive("bulletList") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faListUl} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={`btn-menu ${
                    editor.isActive("orderedList") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faListOl} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`btn-menu ${
                    editor.isActive("codeBlock") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faCodeBranch} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  className={`btn-menu ${
                    editor.isActive("blockquote") ? "is-active" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faQuoteLeft} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                  className="btn-menu"
                >
                  <FontAwesomeIcon icon={faGripLines} />
                </button>
                <button
                  onClick={() => editor.chain().focus().setHardBreak().run()}
                  className="btn-menu"
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                </button>
                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  className="btn-menu"
                >
                  <FontAwesomeIcon icon={faUndo} />
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  className="btn-menu"
                >
                  <FontAwesomeIcon icon={faRedo} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().setColor("#958DF1").run()
                  }
                  className={`btn-menu ${
                    editor.isActive("textStyle", { color: "#958DF1" })
                      ? "is-active"
                      : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faHighlighter} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  className={`btn-menu ${
                    editor.isActive({ textAlign: "left" }) ? "is-active" : ""
                  }`}
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
                >
                  <FontAwesomeIcon icon={faAlignJustify} />
                </button>
              </div>
            </div>

            {/* Table Management Buttons */}
            <div
              className="button-group table-settings overflow-x-auto py-1"
              style={{ whiteSpace: "nowrap" }}
            >
              <button
                className="btn-menu"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
              >
                <FontAwesomeIcon icon={faTable} />
              </button>
              <button
                className="btn-menu"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Column Before
              </button>
              <button
                className="btn-menu"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Column After
              </button>
              <button
                className="btn-menu"
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                <FontAwesomeIcon icon={faMinus} /> Delete Column
              </button>
              <button
                className="btn-menu"
                onClick={() => editor.chain().focus().addRowBefore().run()}
              >
                <FontAwesomeIcon icon={faArrowUp} /> Add Row Before
              </button>
              <button
                className="btn-menu"
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                <FontAwesomeIcon icon={faArrowDown} /> Add Row After
              </button>
              <button
                className="btn-menu"
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                <FontAwesomeIcon icon={faMinus} /> Delete Row
              </button>
              <button
                className="btn-menu"
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <FontAwesomeIcon icon={faTrash} /> Delete Table
              </button>
            </div>
          </div>
          <EditorContent editor={editor} />
        </>
      )}
    </div>
  );
}

export default NotePadMainContent;
