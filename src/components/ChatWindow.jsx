import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "../assets/css/ChatWindow.css";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = async (messageToSend) => {
    if (!messageToSend.trim()) return;

    // Add the user's message to the chat
    const userMessage = {
      sender: "user",
      message: messageToSend,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // Send the user's message to the API
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

      // Add the API response as a "receiver" message in the chat
      const apiResponseMessage = {
        sender: "api",
        message: data.agent.response || data.message,
        followups: data.agent.followup || [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, apiResponseMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      // Clear the input field
      setNewMessage("");
    }
  };

  const handleFollowupClick = async (followupText) => {
    // Send the follow-up text as a message
    await sendMessage(followupText);
  };

  return (
    <Container fluid className="chat-container">
      <Row className="d-flex justify-content-center">
        <Col>
          <div className="chat-window">
            <div className="chat-header">
              <h5 className="mb-0">Data Source</h5>
            </div>
            <div className="message-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={msg.sender === "user" ? "message-sender" : "message-receiver"}
                >
                  <div>
                    <p
                      className={`small rounded-3 p-2 ${
                        msg.sender === "user" ? "bg-primary text-white" : "bg-light"
                      }`}
                    >
                      {msg.message}
                    </p>
                    <h6 className="small timestamp">{msg.timestamp}</h6>
                  </div>
                  {msg.sender === "user" ? (
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp"
                      alt="avatar 1"
                      style={{ width: "45px", height: "100%" }}
                    />
                  ) : (
                    <div className="avatar">A</div>
                  )}
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
              />
              <Button
                variant="link"
                className="ms-3 pe-2"
                onClick={() => sendMessage(newMessage)}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatWindow;
