import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import createApiCall, { GET, POST } from "../api/api";
import { ToastContainer, toast } from "react-toastify";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import { Tabs, Tab } from "react-bootstrap";
import ReactMarkdown from "react-markdown";

import CodeEditor from "./chatUtilityComponents/CodeEditor";
import VisualizeData from "./chatUtilityComponents/VisualizeData";

function ChatMainContent({ selectedChatId }) {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState();
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState("");
  const [isHistoricChat, setChatHistory] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState([]);
  const [currentDataBase, setCurrentDataBase] = useState("");
  const lastMessageRef = useRef(null);

  const connectedDataSourcesApi = createApiCall("connecteddatabases", GET);
  const fetchChatHistory = createApiCall(`chatlogBySessionId`);
  const newMessageApi = createApiCall("newMessage", POST);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;
  const psid = appData?.psid;
  const sessionId = appData?.chatData?.sessionID;
  const selectedDataSource = appData?.chatData?.selectedDataSource;

  // Start new chat
  const handleNewSession = () => {
    const appData = JSON.parse(localStorage.getItem("appData")) || {};

    const updatedAppData = {
      ...appData,
      chatData: {
        ...(appData.chatData || {}),
      },
    };

    delete updatedAppData.chatData.sessionID;
    delete updatedAppData.chatData.selectedDataSource;

    localStorage.setItem("appData", JSON.stringify(updatedAppData));
    setChatHistory(false);
    setMessages([]);
  };

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

  const setDataSource = (data) => {
    const appData = JSON.parse(localStorage.getItem("appData")) || {};
    appData.chatData = {
      ...appData.chatData,
      selectedDataSource: data,
    };
    localStorage.setItem("appData", JSON.stringify(appData));
  };
  useEffect(() => {
    if (chat) {
      handleNewMessage(chat);
    }
  }, [chat]);

  // Fetch chat history
  useEffect(() => {
    let urlParams = {};

    if (
      (selectedChatId !== "new_chat" && selectedChatId !== null) ||
      sessionId
    ) {
      if (!sessionId) {
        setChatHistory(true);
        urlParams = { sessionId: selectedChatId };
      } else {
        urlParams = { sessionId: sessionId };
      }

      setLoading(true);

      fetchChatHistory({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        urlParams: urlParams,
      })
        .then((response) => {
          setMessages(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching chat history:", error);
          setLoading(false);
        });
    } else {
      handleNewSession();
    }
  }, [selectedChatId, sessionId]);

  const handleNewMessage = () => {
    if (!selectedDataSource) {
      toast.error("Please select a Data Source!", { autoClose: 500 });
    } else {
      if (chat.trim().length > 1) {
        const newMessage = {
          message: [{ human: chat }],
          context: {},
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setLoadingMessages((prevLoading) => [...prevLoading, chat]);

        setChat("");
        const body = {
          message: chat,
          database: selectedDataSource,
          psid: psid,
          ...(sessionId ? { sessionId: sessionId } : {}),
        };

        newMessageApi({
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: body,
        })
          .then((response) => {
            const data = response;

            if (data) {
              const appData = JSON.parse(localStorage.getItem("appData"));
              const updatedAppData = {
                ...appData,
                chatData: {
                  ...appData.chatData,
                  sessionID: data.sessionId,
                },
              };
              localStorage.setItem("appData", JSON.stringify(updatedAppData));

              const responseMessage = {
                message: [{ human: chat }], // User's message
                context: {
                  agent: data.agent || "No agent response", // Default value if agent is missing
                  SQL_query: data.SQL_query || "",
                  query_description: data.query_description || "",
                  followup: data.followup ? [data.followup] : [],
                  DB_response: data.DB_response || [],
                  error: "", // If there is an error, it can be added here
                },
              };

              setMessages((prevMessages) => [
                ...prevMessages.slice(0, -1), // Remove the placeholder message
                responseMessage,
              ]);
              setLoadingMessages((prevLoading) =>
                prevLoading.filter((msg) => msg !== chat)
              ); // Remove loading message
            } else {
              toast.error("Error: Missing response data.", { autoClose: 500 });
              console.error("Error: Missing response data.");
            }
          })
          .catch((error) => {
            toast.error("Error sending message", { autoClose: 500 });
            console.error("Error sending message:", error);
          });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isHistoricChat) {
      e.preventDefault();
      handleNewMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
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
                        disabled={sessionId && selectedDataSource}
                        value={selectedDataSource || currentDataBase || ""}
                        onChange={(e) => {
                          const selectedOption =
                            e.target.options[e.target.selectedIndex];
                          setDataSource(
                            selectedOption.getAttribute("data-key")
                          );
                          setCurrentDataBase(
                            selectedOption.getAttribute("data-key")
                          );
                        }}
                      >
                        <option value="" disabled>
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
              {messages.map((msg, index) => (
                <div key={index} className="chat-bubbles">
                  {/* User Message */}
                  {msg.message.map((dialogue, idx) => (
                    <div key={idx}>
                      <div className="my-2 d-flex justify-content-end ms-auto">
                        <div
                          className="chat-human bg-light shadow rounded text-wrap text-break text-sm p-1 p-md-2"
                          style={{ maxWidth: "75%", width: "auto" }}
                        >
                          {dialogue.human}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Agent Response or Loading Spinner */}

                  {loadingMessages.includes(msg.message[0].human) ? (
                    // Loader inside chat bubble
                    <div className="ai shadow bg-white w-25 p-3">
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div
                          className="spinner-border text-green"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="ai shadow bg-white w-75 p-2"
                      style={{ minHeight: "40vh", fontSize: "0.85rem" }}
                    >
                      <Tabs
                        defaultActiveKey="agent"
                        id={`ai-response-tabs-${index}`}
                        className="mb-3"
                      >
                        {/* Error Tab */}
                        {msg.context.error && msg.context.error !== "" && (
                          <Tab eventKey="error" title="Error">
                            <div>
                              <strong>Error:</strong> {msg.context.error}
                            </div>
                          </Tab>
                        )}

                        {/* Agent Tab */}
                        {msg.context.agent && (
                          <Tab eventKey="agent" title="Agent">
                            <div>
                              <div className="ps-2">
                                <ReactMarkdown>
                                  {msg.context.agent}
                                </ReactMarkdown>
                              </div>

                              {msg.context.followup &&
                                msg.context.followup.length > 0 && (
                                  <>
                                    <hr className="mx-3 mt-4" />
                                    <div className="mt-1">
                                      <div className="row d-flex mx-3">
                                        {msg.context.followup.map(
                                          (item, followupIndex) => (
                                            <div
                                              className="col-12 col-lg-4 d-flex mb-3"
                                              key={followupIndex}
                                            >
                                              <button
                                                className={`${
                                                  isHistoricChat
                                                    ? "btn-black-disabled"
                                                    : "btn-black"
                                                } rounded w-100 p-2 d-flex align-items-center justify-content-center`}
                                                onClick={() => {
                                                  setChat(item);
                                                  handleNewMessage(item);
                                                }}
                                              >
                                                {item}
                                              </button>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                            </div>
                          </Tab>
                        )}

                        {/* SQL Query Tab */}
                        {msg.context.SQL_query && (
                          <Tab eventKey="sql-query" title="SQL Query">
                            <CodeEditor SQL_query={msg.context.SQL_query} />
                            <div className="py-2">
                              <ReactMarkdown>
                                {msg.context.query_description}
                              </ReactMarkdown>
                            </div>
                          </Tab>
                        )}

                        {/* DB Response Tab */}
                        {msg.context.DB_response &&
                          msg.context.DB_response.length > 0 && (
                            <Tab eventKey="db-response" title="Visualize Data">
                              <div>
                                <VisualizeData
                                  DB_response={msg.context.DB_response}
                                />
                              </div>
                            </Tab>
                          )}
                      </Tabs>
                    </div>
                  )}
                  <div ref={lastMessageRef}></div>
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
