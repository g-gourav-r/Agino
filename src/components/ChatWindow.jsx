import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Spinner, Tooltip, OverlayTrigger, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane, faCopy, faDownload } from "@fortawesome/free-solid-svg-icons";
import "../assets/css/ChatWindow.css";

// Utility function to generate a UUID for unique session IDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Retrieve the JWT token from localStorage
let token = localStorage.getItem('token');

// Retrieve or create a session ID (psid)
function getPsid() {
  let psid = localStorage.getItem('psid');
  if (!psid) {
    psid = generateUUID();
    localStorage.setItem('psid', psid);
  }
  return psid;
} 

const psid = getPsid();
const email = localStorage.getItem('email');

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessageId, setLoadingMessageId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Retrieve session ID from localStorage on component mount
    const storedSessionId = localStorage.getItem("sessionId");
    setSessionId(storedSessionId);

    // Scroll to the latest message when messages change
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (messageToSend) => {
    if (!messageToSend.trim()) return;

    // Get the current session ID from localStorage
    const currentSessionId = localStorage.getItem("sessionId");

    // Create a user message object and add it to the message list
    const userMessage = {
      id: Date.now(),
      sender: "user",
      message: messageToSend,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Create a placeholder message while waiting for the API response
    const placeholderMessage = {
      id: Date.now() + 1,
      sender: "api",
      message: "Loading...",
      timestamp: new Date().toLocaleTimeString(),
      loading: true,
    };
    setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

    setNewMessage("");
    setLoadingMessageId(placeholderMessage.id);

    try {
      // Use environment variable for the server endpoint
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/newMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          psid: psid,
          message: messageToSend,
          database: "classicmodels",
          newSession: !currentSessionId,
          sessionId: currentSessionId || undefined,
        }),
      });

      const data = await response.json();

      // Extract data from API response
      const agent_response = data.agent ?? "";
      const query_description = data.query_description ?? "";
      const followup = data.followup ?? [];
      const SQL_query = data.SQL_query ?? "";
      const DB_response = data.DB_response ?? [];
      const newSessionId = data.sessionId ?? null;

      // Save the new session ID to localStorage if it exists
      if (newSessionId) {
        localStorage.setItem("sessionId", newSessionId);
        setSessionId(newSessionId);
      }

      // Update the placeholder message with the actual response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === placeholderMessage.id
            ? {
                ...msg,
                message: (
                  <>
                    {agent_response && <div>{agent_response}</div>}
                    {SQL_query && (
                      <div className="code-editor-container">
                        <pre className="code-block">{SQL_query}</pre>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="copy-tooltip">Copy Query</Tooltip>}
                        >
                          <Button
                            variant="outline-primary"
                            onClick={() => navigator.clipboard.writeText(SQL_query)}
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    )}
                    {query_description && (
                      <div className="query-description">
                        <p>{query_description}</p>
                      </div>
                    )}
                    {DB_response.length > 0 && (
                      <Table striped bordered hover className="mt-3">
                        <thead>
                          <tr>
                            {Object.keys(DB_response[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {DB_response.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i}>{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </>
                ),
                followups: followup.length > 0 ? followup : null,
                loading: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoadingMessageId(null);
    }
  };

  const handleFollowupClick = async (followupText) => {
    await sendMessage(followupText);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage(newMessage);
    }
  };

  const handleDownload = async () => {
    if (!sessionId) return;

    try {
      // Use environment variable for the server endpoint
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/chatlogBySessionId?sessionId=${sessionId}`);
      const data = await response.json();
      console.log("Downloaded Chat History:", data);
    } catch (error) {
      console.error("Error downloading chat history:", error);
    }
  };

  return (
    <Container fluid className="chat-container">
      <Row className="d-flex flex-column h-100">
        <Col className="chat-window">
          <div className="chat-header">
            <h5 className="mb-0">Chat Window</h5>
          </div>
          <div className="message-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.sender === "user" ? "message-sender" : "message-receiver"
                }`}
              >
                {msg.sender === "api" ? (
                  <div className="message-content-receiver">
                    <div className="avatar">A</div>
                    <div className="message-text-container">
                      {msg.loading ? (
                        <div className="spinner-container">
                          <Spinner animation="border" size="sm" />
                        </div>
                      ) : (
                        <div className="message-text">
                          {msg.message}
                          {msg.followups && msg.followups.length > 0 && (
                            <div className="followups mt-2">
                              {msg.followups.map((followup, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline-primary"
                                  className="me-2"
                                  onClick={() => handleFollowupClick(followup)}
                                >
                                  {followup}
                                </Button>
                              ))}
                            </div>
                          )}
                          {sessionId && (
                            <Button
                              variant="outline-secondary"
                              className="mt-2"
                              onClick={handleDownload}
                            >
                              <FontAwesomeIcon icon={faDownload} /> Download Chat
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="message-content-sender">
                    <p className="message-text">{msg.message}</p>
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp"
                      alt="avatar 1"
                      className="avatar"
                    />
                  </div>
                )}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className="chat-footer">
            <Button variant="link" className="text-muted px-4">
              <FontAwesomeIcon icon={faPaperclip} />
            </Button>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Type message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button variant="link" className="text-muted px-4" onClick={() => sendMessage(newMessage)}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatWindow;
