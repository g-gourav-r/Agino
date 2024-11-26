import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import createApiCall, { GET } from "../api/api";
import { ToastContainer, toast } from "react-toastify";
import MutatingDotsLoader from "../Loaders/MutatingDots";

function ChatMainContent({ selectedChatId }) {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState();
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState("");
  const [isHistoricChat, setChatHistory] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [newSession, setNewSession] = useState(false);
  const [messages, setMessages] = useState([]);

  const connectedDataSourcesApi = createApiCall("connecteddatabases", GET);
  const fetchChatHistory = createApiCall(`chatlogBySessionId`);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  // Fetch the connected DBSources
  useEffect(() => {
    if (!token) return;

    setLoading(true);

    connectedDataSourcesApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        setLoading(false);
        setDataSources(response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching configurable data sources:", error);
      });
  }, []);

  // Fetch chat history
  useEffect(() => {
    if (selectedChatId) {
      setChatHistory(true);
      setLoading(true);
      fetchChatHistory({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        urlParams: { sessionId: selectedChatId },
      }).then((respose) => {
        setMessages(respose.data);
        setLoading(false);
      });
    }
  }, [selectedChatId]);

  const handleNewMessage = () => {
    if (selectedDataSource.trim().length < 1) {
      toast.error("Please select a Data Source !", { autoClose: 500 });
    } else {
      if (chat.trim().length > 1) {
        setNewSession(true);
        alert(chat);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isHistoricChat) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="chat-container d-flex flex-column h-100">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <MutatingDotsLoader />
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div id="chat-header" className="chat-header">
              <div className="bg-light m-2 p-2 border rounded d-flex align-items-center">
                {dataSources && dataSources.length > 0 ? (
                  !isHistoricChat ? (
                    <>
                      <FontAwesomeIcon
                        className="ms-auto me-2"
                        icon={faDatabase}
                      />
                      <select
                        className="btn-menu rounded"
                        name="dataSource"
                        id="dataSource"
                        disabled={newSession}
                        onChange={(e) => {
                          const selectedOption =
                            e.target.options[e.target.selectedIndex];
                          setSelectedDataSource(
                            selectedOption.getAttribute("data-key")
                          );
                        }}
                      >
                        <option value="" disabled selected>
                          Select a Data Source
                        </option>
                        {dataSources.map((dataSource, index) => (
                          <option
                            key={index}
                            data-key={dataSource.database}
                            value={dataSource.aliasName}
                          >
                            {dataSource.aliasName}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <p className="ms-auto m-0 px-2">
                      You are viewing a previous conversation with{" "}
                      <span className="text-green">Agino</span>.
                    </p>
                  )
                ) : (
                  <p className="ms-auto m-0">
                    Welcome to <span className="text-green">Agino</span>.
                    Connect a
                    <a href="/datasource" className="text-decoration-none">
                      {" "}
                      datasource
                    </a>{" "}
                    to get started.
                  </p>
                )}
              </div>
            </div>

            {/* Chat Body */}
            <div
              id="chat-body"
              className="chat-body border chat-content overflow-auto mx-2 mb-2 rounded flex-grow-1 p-2"
            >
              {messages.map((msg) => (
                <div key={msg._id} className="chat-bubbles">
                  {/* User Message */}
                  {msg.message.map((dialogue, index) => (
                    <div key={index}>
                      <div className="w-75 my-2 d-flex justify-content-end ms-auto">
                        <div className="chat-human  text-end p-2 bg-light shadow rounded">
                          {dialogue.human}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Agent Response */}
                  <div className="ai shadow bg-light w-75 my-3">
                    <div>
                      <p>{msg.context.agent}</p>
                    </div>
                    <div>
                      <strong>SQL Query:</strong> {msg.context.SQL_query}
                    </div>
                    <div>
                      <strong>Query Description:</strong>{" "}
                      {msg.context.query_description}
                    </div>
                    {msg.context.followup && (
                      <div>
                        <strong>Follow-up Questions:</strong>
                        <ul>
                          {msg.context.followup.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.context.DB_response && (
                      <div>
                        <strong>DB Response:</strong>
                        <ul>
                          {msg.context.DB_response.map((response, index) => (
                            <li key={index}>
                              {Object.entries(response).map(([key, value]) => (
                                <div key={key}>
                                  <strong>{key}:</strong> {value}
                                </div>
                              ))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.context.error && msg.context.error !== "" && (
                      <div>
                        <strong>Error:</strong> {msg.context.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div
              id="chat-input"
              className={`chat-input ${isHistoricChat ? "d-none" : ""}`}
            >
              <div className="mx-2 mb-2 rounded border d-flex bg-light align-items-center">
                <span
                  className="sendButton p-2"
                  onClick={() => navigate("/datasource")}
                >
                  <FontAwesomeIcon icon={faDatabase} />
                </span>
                <input
                  type="text"
                  value={chat}
                  onChange={(e) => setChat(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-100 border rounded p-1"
                  placeholder="Start typing here"
                />
                <span onClick={handleNewMessage}>
                  <FontAwesomeIcon
                    className="fx2 sendButton p-2 me-1"
                    icon={faPaperPlane}
                  />
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ChatMainContent;
