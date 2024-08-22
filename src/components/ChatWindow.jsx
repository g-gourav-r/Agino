import React, { useState } from "react";
import { Container, Row, Col, Button, Spinner, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane, faCopy } from "@fortawesome/free-solid-svg-icons";
import "../assets/css/ChatWindow.css";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessageId, setLoadingMessageId] = useState(null);

  const sendMessage = async (messageToSend) => {
    if (!messageToSend.trim()) return;

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
          newSession: true,
          sessionId: "66c63a11021999ace68f57ee",
        }),
      });

      const data = await response.json();
      const { SQL_query, DB_response, insight, query_description } = data;

      setMessages((prevMessages) => prevMessages.map(msg =>
        msg.id === placeholderMessage.id
          ? {
              ...msg,
              message: `Response: ${data.response}\n\nInsight: ${insight}`,
              followups: data.followup || [],
              loading: false,
            }
          : msg
      ));

      if (SQL_query) {
        const queryMessage = {
          id: Date.now() + 2,
          sender: "api",
          message: (
            <>
              <div className="sql-query-container">
                <pre>{SQL_query}</pre>
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
              <div className="sql-result-container">
                <pre>{JSON.stringify(DB_response, null, 2)}</pre>
              </div>
              <div className="query-description">
                <p>{query_description}</p>
              </div>
            </>
          ),
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prevMessages) => [...prevMessages, queryMessage]);
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
                className={`message ${msg.sender === "user" ? "message-sender" : "message-receiver"}`}
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
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatWindow;
