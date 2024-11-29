import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { jsPDF } from "jspdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faStrikethrough,
  faCode,
  faParagraph,
  faListUl,
  faListOl,
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
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
// Tiptap imports
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Highlight from "@tiptap/extension-highlight";
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
  const [showEmailModal, setEmailModal] = useState(false);
  const [sendingMail, setSendingMail] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: "",
    to: "",
    body: "",
  });

  const saveNotesAPI = createApiCall("api/notes", POST);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  const handleSubmit = async () => {
    try {
      if (
        !emailData.to ||
        !/^[\w.%+-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(emailData.to)
      ) {
        toast.error("Please enter a valid email address.");
        return;
      }

      if (!emailData.subject) {
        toast.error("Subject is required.");
        return;
      }

      if (!emailData.body) {
        toast.error("Body cannot be empty.");
        return;
      }

      const content = editor
        .getHTML()
        .replace(/<table/g, '<table class="table-pdf"');
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = content;
      document.body.appendChild(tempContainer);

      const options = {
        margin: 1,
        filename: `${title}.pdf`,
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

      const pdfBlob = await html2pdf()
        .from(tempContainer)
        .set(options)
        .output("blob");

      document.body.removeChild(tempContainer);

      setSendingMail(true);

      const emailAPI = createApiCall("sendmail", POST);

      const formData = new FormData();
      formData.append("file", pdfBlob, `${title}.pdf`); //Change to buffer
      formData.append("to", emailData.to);
      formData.append("subject", emailData.subject);
      formData.append("body", emailData.body);

      console.log(formData);

      // Send the API request
      await emailAPI({
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      toast.success("Email sent successfully!");
      setSendingMail(false);
      setEmailModal(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
      setSendingMail(false);
      setEmailModal(false);
    }
  };

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
      Highlight.configure({
        HTMLAttributes: {
          class: "highlight-text",
        },
      }),
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

  const handleDownload = async () => {
    handleSave();

    // Validate if title is provided
    if (title.trim().length < 1) {
      toast.error("Please provide a title before downloading.", {
        autoClose: 2000,
      });
      return;
    }

    // Get the HTML content
    const content = editor
      .getHTML()
      .replace(/<table/g, '<table class="table-pdf"');

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = content;
    document.body.appendChild(tempContainer);

    console.log(document.body.appendChild(tempContainer));

    // Define html2pdf options
    const options = {
      margin: [0.5, 0.5, 1, 0.5], // top, right, bottom, left
      filename: title,
      image: { type: "jpeg", quality: 2 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
      pagebreak: { mode: "avoid-all" },
    };

    try {
      // Generate PDF with border and watermark
      await html2pdf()
        .from(tempContainer)
        .set(options)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          // Add border to each page
          const pageCount = pdf.internal.getNumberOfPages();

          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);

            // Add thin border
            pdf.setLineWidth(0.01);
            pdf.rect(0.4, 0.4, 7.7, 10.2, "S");

            // Add watermark/text
            pdf.setFontSize(10);
            pdf.setTextColor(150); // Light gray color for "Powered by"
            pdf.text("Powered by", 7.8, 10.8, {
              align: "right",
              angle: 0, // Optional: rotate the text
            });

            pdf.setTextColor(40, 167, 69); // Green color for "Agino"
            pdf.textWithLink("Agino", 8.2, 10.8, {
              url: "https://agino.tech",
              align: "right", // Align the text to the right
            });
          }

          // Save the PDF
          pdf.save(title);
        });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      // Clean up the temporary container
      document.body.removeChild(tempContainer);
    }
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
      return;
    }
    handleSave();
    setEmailModal(true);
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
                    editor.isActive("bold") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Bold"
                >
                  <FontAwesomeIcon icon={faBold} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  className={`btn-menu${
                    editor.isActive("italic") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Italic"
                >
                  <FontAwesomeIcon icon={faItalic} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  disabled={!editor.can().chain().focus().toggleStrike().run()}
                  className={`btn-menu${
                    editor.isActive("strike") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Strikethrough"
                >
                  <FontAwesomeIcon icon={faStrikethrough} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  disabled={!editor.can().chain().focus().toggleCode().run()}
                  className={`btn-menu${
                    editor.isActive("code") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Code"
                >
                  <FontAwesomeIcon icon={faCode} />
                </button>
                <button
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className={`btn-menu${
                    editor.isActive("paragraph") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Paragraph"
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
                    className={`btn-menu${
                      editor.isActive("heading", { level: i + 1 })
                        ? " is-active"
                        : ""
                    }`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Heading ${i + 1}`}
                  >
                    H{i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={`btn-menu${
                    editor.isActive("bulletList") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Bullet List"
                >
                  <FontAwesomeIcon icon={faListUl} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={`btn-menu${
                    editor.isActive("orderedList") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Ordered List"
                >
                  <FontAwesomeIcon icon={faListOl} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`btn-menu${
                    editor.isActive("codeBlock") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Code Block"
                >
                  <FontAwesomeIcon icon={faTerminal} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  className={`btn-menu${
                    editor.isActive("blockquote") ? " is-active" : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Blockquote"
                >
                  <FontAwesomeIcon icon={faQuoteLeft} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                  className="btn-menu"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Horizontal Rule"
                >
                  <FontAwesomeIcon icon={faGripLines} />
                </button>
                <button
                  onClick={() => editor.chain().focus().setHardBreak().run()}
                  className="btn-menu"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Hard Break"
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                </button>
                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  className="btn-menu"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Undo"
                >
                  <FontAwesomeIcon icon={faUndo} />
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  className="btn-menu"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Redo"
                >
                  <FontAwesomeIcon icon={faRedo} />
                </button>
                <button
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .toggleHighlight({ color: "#ffcc00" })
                      .run()
                  }
                  className={`btn-menu${
                    editor.isActive("highlight", { color: "#ffcc00" })
                      ? " is-active"
                      : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Highlight"
                >
                  <FontAwesomeIcon icon={faHighlighter} />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  className={`btn-menu${
                    editor.isActive({ textAlign: "left" }) ? " is-active" : ""
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
                  className={`btn-menu${
                    editor.isActive({ textAlign: "center" }) ? " is-active" : ""
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
                  className={`btn-menu${
                    editor.isActive({ textAlign: "right" }) ? " is-active" : ""
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
                  className={`btn-menu${
                    editor.isActive({ textAlign: "justify" })
                      ? " is-active"
                      : ""
                  }`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Align Justify"
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
          {showEmailModal && (
            <>
              <div
                className="modal-backdrop opacity-25 rounded"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              ></div>
              <div className="modal show d-block" tabIndex="-1">
                {" "}
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content bg-white rounded p-2">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Share via <span className="text-green">Email</span>
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setEmailModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <form>
                        {/* To Field */}
                        <div className="mb-3">
                          <label htmlFor="emailTo" className="form-label">
                            To
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="emailTo"
                            value={emailData.to}
                            onChange={(e) =>
                              setEmailData({ ...emailData, to: e.target.value })
                            }
                          />
                        </div>

                        {/* Subject Field */}
                        <div className="mb-3">
                          <label htmlFor="emailSubject" className="form-label">
                            Subject
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="emailSubject"
                            value={emailData.subject}
                            onChange={(e) =>
                              setEmailData({
                                ...emailData,
                                subject: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* Body Field */}
                        <div className="mb-3">
                          <label htmlFor="emailBody" className="form-label">
                            Body
                          </label>
                          <textarea
                            className="form-control"
                            id="emailBody"
                            rows="5"
                            value={emailData.body}
                            onChange={(e) =>
                              setEmailData({
                                ...emailData,
                                body: e.target.value,
                              })
                            }
                          ></textarea>
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      <button
                        className={`${
                          sendingMail ? "btn-green-disabled" : "btn-green"
                        } p-1 w-25 rounded`}
                        onClick={handleSubmit}
                        disabled={sendingMail}
                      >
                        {sendingMail ? "Sending..." : "Send"}
                      </button>
                      <button
                        className="btn btn-secondary p-1 w-25 rounded"
                        onClick={() => setEmailModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default NotePadMainContent;
