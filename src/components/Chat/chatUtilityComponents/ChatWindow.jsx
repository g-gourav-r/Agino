import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader/ChatHeader.jsx";
import ChatInput from "./ChatInput/ChatInput.jsx";
import CodeEditor from "./CodeEditor.jsx";
import DatabaseTable from "./DatabaseTable.jsx";
import FollowupButtons from "./FollowupButtons.jsx";
import createApiCall, { POST, GET } from "../api/api.jsx";
import DNALoader from "../Loaders/DNALoader.jsx";
import MutatingDotsLoader from "../Loaders/MutatingDots.jsx";
import {toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

function ChatWindow({ isNewChat, resetNewChat, selectedChatId }) {
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessageId, setLoadingMessageId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChatFromHistory, setIsChatFromHistory] = useState(false);
  const chatContentRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Agent Response");

  const newMessageApi = createApiCall("newMessage", POST);
  const getChatHistoryApi = createApiCall("chatlogBySessionId", GET);

  const handleSelectDatabase = (db) => {
    setSelectedDatabase(db);
    localStorage.setItem("database", db.database);
    localStorage.setItem("databaseAliasName", db.aliasName);
  };

  const handleCopyResponse = (response) => {
    if (!response) {
      toast.info("No response available to copy!",{autoClose: 500});
      return;
    }
  
    navigator.clipboard
      .writeText(response)
      .then(() => {
        toast.info("Response copied to clipboard!",{autoClose: 500});
      })
      .catch((err) => {
        console.error("Failed to copy response: ", err);
        toast.info("Failed to copy. Please try again.",{autoClose: 500});
      });
  };
  

  useEffect(() => {
    if (isNewChat) {
      setMessages([]);
      localStorage.removeItem("sessionId");
      localStorage.removeItem("database");
      localStorage.removeItem("history");
      resetNewChat();
      setIsChatFromHistory(false);
    }
  }, [isNewChat, resetNewChat]);

  useEffect(() => {
    const sessionIdFromStorage = localStorage.getItem("sessionId");
    const fetchChatHistory = async (sessionId) => {
      if (sessionId) {
        if (localStorage.getItem("history")){
          setIsChatFromHistory(true);
        }
        const token = localStorage.getItem("token");
  
        try {
          setLoading(true); // Start loading
          const response = await getChatHistoryApi({
            urlParams: { sessionId: sessionId },
            headers: { Authorization: `Bearer ${token}` },
          });
  
          if (response && response.data) {
            localStorage.setItem("sessionId", sessionId);
            const newMessages = response.data
              .map((chat) => [
                {
                  id: chat._id + "_human",
                  sender: "human",
                  message: chat.message[0].human,
                },
                {
                  id: chat._id + "_ai",
                  sender: "ai",
                  message: (
                    <div className="message-content">
                    {/* Scrollable Tabs */}
                    <div className="overflow-auto">
                      <Tabs
                        defaultActiveKey="Agent Response"
                        id="uncontrolled-tab-example"
                        className="d-flex flex-nowrap"
                      >
                        {/* Agent Response Tab */}
                        {chat.context.agent && (
                          <Tab eventKey="Agent Response" title="Agent Response">
                            <div>{chat.context.agent}</div>
                            <div className="buttons text-end">
                              <button className="btn-outline m-1 p-1" onClick={() => handleCopyResponse(chat.context.agent)}><FontAwesomeIcon icon={faCopy} /></button>
                            </div>
                            {chat.context.followup && chat.context.followup.length > 0 && (
                              <FollowupButtons
                                followups={chat.context.followup}
                                onFollowupClick={handleFollowupClick}
                              />
                            )}
                          </Tab>
                        )}
                  
                        {/* SQL Query Tab */}
                        {(chat.context.SQL_query || chat.context.query_description) && (
                          <Tab eventKey="SQL Query" title="SQL Query">
                            {chat.context.SQL_query && (
                              <div className="code-editor-container my-1">
                                <CodeEditor SQL_query={chat.context.SQL_query} />
                              </div>
                            )}
                            {chat.context.query_description && (
                              <div className="query-description my-1">
                                <p>{chat.context.query_description}</p>
                              </div>
                            )}
                          </Tab>
                        )}
                  
                        {/* Visualize Data Tab */}
                        {chat.context.DB_response && (
                          <Tab eventKey="Visualize Data" title="Visualize Data">
                            <div className="database-table-container">
                              <DatabaseTable
                                DB_response={chat.context.DB_response}
                                ChatLogId={chat._id}
                                handleShare={shareEmail}
                              />
                            </div>
                          </Tab>
                        )}
                      </Tabs>
                    </div>
                  </div>
                  
                  ),
                },
              ])
              .flat();
            setLoading(false);
            setMessages(newMessages);
          } else {
            console.error("No chat history found.");
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      }
    };
  
    if (selectedChatId) {
      fetchChatHistory(selectedChatId); // Fetch based on selectedChatId
    } else if (sessionIdFromStorage) {
      fetchChatHistory(sessionIdFromStorage); // Fetch based on sessionId from localStorage on page load
    }
  }, [selectedChatId]);
  

  useEffect(() => {
    if (chatContentRef.current) {
      const lastHumanMessage = [...chatContentRef.current.children]
        .reverse()
        .find(
          (child) =>
            child.classList.contains("chat-bubble") &&
            child.classList.contains("human"),
        );

      if (lastHumanMessage) {
        chatContentRef.current.scrollTop = lastHumanMessage.offsetTop - 100;
      } else {
        // If no human message is found, scroll to the bottom
        chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const shareEmail = () => {
    const subject = encodeURIComponent("Chat Summary");

    let body = "Chat Summary:\n\n"; // Initialize body for the email content

    // Iterate through messages and build the body content
    messages.forEach((msg) => {
      if (msg.sender === "human") {
        body += `You:\n${msg.message}\n\n`; // Human message
      } else if (msg.sender === "ai") {
        body += `AI:\n${extractMessageContent(msg.message)}\n\n`; // AI message, extract its content
      }
    });

    // Construct the mailto URI with the subject and body
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`;

    // Open the mail draft
    window.location.href = mailtoLink;
  };

  // Helper function to extract content from AI message
  const extractMessageContent = (messageContent) => {
    // If messageContent is a JSX element, extract text (simplified, assumes JSX structure is simple)
    if (typeof messageContent === "object") {
      const div = document.createElement("div");
      div.innerHTML = messageContent.props.children
        .map((child) => {
          return typeof child === "string"
            ? child
            : extractFromComponent(child);
        })
        .join("");
      return div.textContent || div.innerText || ""; // Return extracted text
    }
    return messageContent;
  };

  // Helper function to extract text from components like CodeEditor or DatabaseTable
  const extractFromComponent = (component) => {
    // Check for SQL queries and database responses
    if (component.type === CodeEditor) {
      return `SQL Query:\n${component.props.SQL_query}\n\n`;
    }
    if (component.type === DatabaseTable) {
      return `Database Response:\n${JSON.stringify(component.props.DB_response)}\n\n`;
    }
    return "";
  };

  const handleSend = async (messageToSend) => {
    if (!messageToSend.trim()) return;

    const selectedDatabase = localStorage.getItem("database");
    if (!selectedDatabase) {
      toast.error("Select a database before sending a message.", { autoClose: 3000 });
      return;
    }

    const currentSessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("token");

    const userMessage = {
      id: Date.now(),
      sender: "human",
      message: messageToSend,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const placeholderMessage = {
      id: Date.now() + 1,
      sender: "ai",
      message: <DNALoader />,
      loading: true,
    };
    setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

    setNewMessage("");
    setLoadingMessageId(placeholderMessage.id);
    setErrorMessage("");

    try {
      const data = await newMessageApi({
        body: {
          email: localStorage.getItem("email"),
          psid: localStorage.getItem("psid"),
          message: messageToSend,
          database: localStorage.getItem("database"),
          newSession: !currentSessionId,
          sessionId: currentSessionId || undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        agent = "",
        query_description = "",
        followup = [],
        SQL_query = "",
        DB_response = [],
        sessionId = null,
        chatLogId = null,
      } = data;

      if (sessionId) {
        localStorage.setItem("sessionId", sessionId);
      }

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === placeholderMessage.id
            ? {
                ...msg,
                message: (
                  <div className="message-content">
                    <div className="overflow-auto">
                      <Tabs
                        defaultActiveKey="Agent Response"
                        id="uncontrolled-tab-example"
                        className="mb-3 d-flex"
                        style={{ flexWrap: 'nowrap' }}
                      >
                        {/* Agent Response Tab */}
                        {agent && (
                          <Tab eventKey="Agent Response" title="Agent Response">
                            <div className="py-1">{agent}</div>
                            {followup && followup.length > 0 && (
                              <FollowupButtons followups={followup} onFollowupClick={handleFollowupClick} />
                            )}
                          </Tab>
                        )}

                        {/* SQL Query Tab */}
                        {(SQL_query || query_description) && (
                          <Tab eventKey="SQL Query" title="SQL Query">
                            {SQL_query && (
                              <div className="code-editor-container my-1">
                                <CodeEditor SQL_query={SQL_query} />
                              </div>
                            )}
                            {query_description && (
                              <div className="query-description my-1">
                                <p>{query_description}</p>
                              </div>
                            )}
                          </Tab>
                        )}

                        {/* Visualize Data Tab */}
                        {DB_response && (
                          <Tab eventKey="Visualize Data" title="Visualize Data">
                            <div className="database-table-container">
                              <DatabaseTable
                                DB_response={DB_response}
                                ChatLogId={chatLogId}
                                handleShare={shareEmail}
                              />
                            </div>
                          </Tab>
                        )}
                      </Tabs>
                    </div>
                  </div>
                ),
                loading: false,
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = error?.message || "An unknown error occurred";

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === placeholderMessage.id
            ? {
                ...msg,
                message: (
                  <div className="message-content">
                    <p className="text-danger">Error: {errorMessage}</p>
                  </div>
                ),
                loading: false,
              }
            : msg,
        ),
      );

      setErrorMessage(errorMessage);
    } finally {
      setLoadingMessageId(null);
    }
  };

  const handleFollowupClick = (followupId) => {
    handleSend(followupId);
  };

  return (
    <div className="d-flex flex-column h-100">
      <ToastContainer />
      <div className="flex-shrink-0">
        <ChatHeader
          onSelectDatabase={handleSelectDatabase}
          isChatFromHistory={isChatFromHistory}
        />
      </div>
      <div
        className="chat-content flex-grow-1 overflow-auto p-3 mx-2"
        style={{ height: "calc(100vh - 400px)", overflowY: "auto" }}
        ref={chatContentRef}
      >
        {(loading && localStorage.getItem("history")) ? ( // Show loader if loading
          <div
            className="d-flex flex-column justify-content-center align-items-center mx-auto"
            style={{ height: "100%" }}
          >
            <MutatingDotsLoader/>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.sender}`}
              style={{ textAlign: msg.sender === "human" ? "right" : "left" }}
            >
              {msg.message}
            </div>
          ))
        )}
      </div>
      <div className="flex-shrink-0 mb-2">
        <ChatInput onSend={handleSend} disabled={isChatFromHistory} />
      </div>
    </div>
  );
}

export default ChatWindow;
