import React from 'react';

const CodeEditor = ({ SQL_query }) => {
  if (!SQL_query) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_query);
  };

  return (
    <div className="code-editor-container">
      <pre className="code-block">{SQL_query}</pre>
      <button
        className="copy-button"
        onClick={copyToClipboard}
        onMouseOver={(e) => e.currentTarget.classList.add('hover')}
        onMouseOut={(e) => e.currentTarget.classList.remove('hover')}
      >
        <i className="bi bi-clipboard"></i>
      </button>
    </div>
  );
};

export default CodeEditor;
