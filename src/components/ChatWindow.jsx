import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faPaperPlane,
  faCopy,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/css/ChatWindow.css";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessageId, setLoadingMessageId] = useState(null);
  const [sessionId, setSessionId] = useState(null); // State for session ID
  const messageEndRef = useRef(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    setSessionId(storedSessionId);
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (messageToSend) => {
    if (!messageToSend.trim()) return;

    const currentSessionId = localStorage.getItem("sessionId");

    const userMessage = {
      id: Date.now(),
      sender: "user",
      message: messageToSend,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

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
      const response = await fetch("http://localhost:3000/newMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "prince@gmail.com",
          psid: "1234567890987654",
          message: messageToSend,
          newSession: !currentSessionId, // Only create a new session if no session ID exists
          sessionId: currentSessionId || undefined, // Include session ID if it exists
        }),
      });

      const data = await response.json();
      console.log(data);

      const agent_response = data.agent ?? "";
      const query_description = data.query_description ?? "";
      const followup = data.followup ?? [];
      const SQL_query = data.SQL_query ?? "";
      const DB_response = data.DB_response ?? [];
      const newSessionId = data.sessionId ?? null; // Fetch new session ID from response if available

      if (newSessionId) {
        localStorage.setItem("sessionId", newSessionId); // Store the new session ID
        setSessionId(newSessionId); // Update the state
      }

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
                      <div className="code-editor-container">
                        <pre className="code-block">
                          {JSON.stringify(DB_response, null, 2)}
                        </pre>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="copy-tooltip">Copy Response</Tooltip>}
                        >
                          <Button
                            variant="outline-primary"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                JSON.stringify(DB_response, null, 2)
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    )}
                  </>
                ),
                followups: followup.length > 0 ? followup : null,
                loading: false,
              }
            : msg
        )
      );

      if (followup.length > 0) {
        const followupMessage = {
          id: Date.now() + 3,
          sender: "api",
          message: "Please choose a follow-up action:",
          followups: followup,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prevMessages) => [...prevMessages, followupMessage]);
      }
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
    if (!sessionId) return; // Only proceed if session ID is present

    try {
      const response = await fetch(`http://localhost:3000/chatlogBySessionId?sessionId=${sessionId}`);
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
            <h5 className="mb-0">Data Source</h5>
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
                          {sessionId && ( // Conditionally render download button
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
            <Button
              variant="link"
              className="ms-3 pe-2"
              onClick={() => sendMessage(newMessage)}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </Button>
            {sessionId && ( // Conditionally render download button
              <Button
                variant="outline-secondary"
                className="ms-3 pe-2"
                onClick={handleDownload}
              >
                <FontAwesomeIcon icon={faDownload} /> Download Chat
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatWindow;
