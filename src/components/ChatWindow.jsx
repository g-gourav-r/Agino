import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane, faGear } from "@fortawesome/free-solid-svg-icons";
import "../assets/css/ChatWindow.css";

const ChatWindow = () => {
  return (
    <Container fluid className="chat-container">
      <Row className="d-flex justify-content-center">
        <Col>
          <div className="chat-window">
            <div className="chat-header">
              <h5 className="mb-0">Data Source</h5>
            </div>
            <div className="message-container">
              <div className="message-sender">
                <div>
                  <p className="small rounded-3 bg-primary">
                    What are my top 10 products
                  </p>
                  <h6 className="small timestamp">00:11</h6>
                </div>
                <img
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp"
                  alt="avatar 1"
                  style={{ width: "45px", height: "100%" }}
                />
              </div>

              <div className="message-receiver">
                <div className="avatar">A</div>
                <div>
                  <p className="small rounded-3">
                    Here is the list of products:
                    <ul>
                      <li>item1</li>
                      <li>item2</li>
                      <li>item3</li>
                      <li>item4</li>
                    </ul>
                  </p>
                  <h6 className="small timestamp">00:13</h6>
                </div>
              </div>
              <div className="message-receiver">
                <div className="avatar">A</div>
                <div>
                  <p className="small rounded-3">
                    Here is the list of products:
                    <ul>
                      <li>item1</li>
                      <li>item2</li>
                      <li>item3</li>
                      <li>item4</li>
                    </ul>
                  </p>
                  <h6 className="small timestamp">00:13</h6>
                </div>
              </div>
              <div className="message-receiver">
                <div className="avatar">A</div>
                <div>
                  <p className="small rounded-3">
                    Here is the list of products:
                    <ul>
                      <li>item1</li>
                      <li>item2</li>
                      <li>item3</li>
                      <li>item4</li>
                    </ul>
                  </p>
                  <h6 className="small timestamp">00:13</h6>
                </div>
              </div>
              <div className="message-receiver">
                <div className="avatar">A</div>
                <div>
                  <p className="small rounded-3">
                    Here is the list of products:
                    <ul>
                      <li>item1</li>
                      <li>item2</li>
                      <li>item3</li>
                      <li>item4</li>
                    </ul>
                  </p>
                  <h6 className="small timestamp">00:13</h6>
                </div>
              </div>
              <div className="message-receiver">
                <div className="avatar">A</div>
                <div>
                  <p className="small rounded-3">
                    Here is the list of products:
                    <ul>
                      <li>item1</li>
                      <li>item2</li>
                      <li>item3</li>
                      <li>item4</li>
                    </ul>
                  </p>
                  <h6 className="small timestamp">00:13</h6>
                </div>
              </div>
              <div className="message-receiver">
                <div className="avatar">A</div>
                <div>
                  <p className="small rounded-3">
                    Here is the list of products:
                    <ul>
                      <li>item1</li>
                      <li>item2</li>
                      <li>item3</li>
                      <li>item4</li>
                    </ul>
                  </p>
                  <h6 className="small timestamp">00:13</h6>
                </div>
              </div>


              {/* More messages here */}

            </div>
            <div className="chat-footer">
              <Button variant="link" className="text-muted px-4">
                <FontAwesomeIcon icon={faPaperclip} />
              </Button>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Type message"
              />
              <Button variant="link" className="ms-3 pe-2">
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
