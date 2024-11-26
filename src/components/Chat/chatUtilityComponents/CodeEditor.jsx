import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const CodeEditor = ({ SQL_query }) => {
  if (!SQL_query) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_query);
    toast.info("Copied to clipboard", { autoClose: 200 });
  };

  return (
    <div className="code-editor-container">
      <pre className="code-block">{SQL_query}</pre>
      <button className="copy-button" onClick={copyToClipboard}>
        <FontAwesomeIcon icon={faCopy} />
      </button>
    </div>
  );
};

export default CodeEditor;
