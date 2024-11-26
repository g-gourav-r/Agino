import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import DatabaseTable from './DatabaseTable';
import FollowupButtons from './FollowupButtons';

function MessageContent({
  agent,
  SQL_query,
  query_description,
  DB_response,
  chatLogId,
  shareEmail,
  followup,
  handleFollowupClick
}) {
  // State to control the active tab
  const [activeTab, setActiveTab] = useState('response');

  return (
    <div className="message-content">
      {/* Tab buttons */}
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('response')} className={activeTab === 'response' ? 'active' : ''}>
          Response
        </button>
        <button onClick={() => setActiveTab('sqlQuery')} className={activeTab === 'sqlQuery' ? 'active' : ''}>
          SQL Query
        </button>
        <button onClick={() => setActiveTab('description')} className={activeTab === 'description' ? 'active' : ''}>
          Description
        </button>
        <button onClick={() => setActiveTab('table')} className={activeTab === 'table' ? 'active' : ''}>
          Response Table
        </button>
        <button onClick={() => setActiveTab('followup')} className={activeTab === 'followup' ? 'active' : ''}>
          Follow Ups
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'response' && agent && <div className="py-1">{agent}</div>}

        {activeTab === 'sqlQuery' && SQL_query && (
          <div className="code-editor-container my-1">
            <CodeEditor SQL_query={SQL_query} />
          </div>
        )}

        {activeTab === 'description' && query_description && (
          <div className="query-description my-1">
            <p>{query_description}</p>
          </div>
        )}

        {activeTab === 'table' && (
          <div className="database-table-container">
            <DatabaseTable DB_response={DB_response} ChatLogId={chatLogId} handleShare={shareEmail} />
          </div>
        )}

        {activeTab === 'followup' && followup.length > 0 && (
          <FollowupButtons followups={followup} onFollowupClick={handleFollowupClick} />
        )}
      </div>
    </div>
  );
}

export default MessageContent;
