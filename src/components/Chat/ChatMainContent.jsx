import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import createApiCall, { GET } from "../api/api";
import { ToastContainer, toast } from "react-toastify";

function ChatMainContent() {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState();
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState("");
  const [isHistoricChat, setChatHistory] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [newSession, setNewSession] = useState(false);

  const connectedDataSourcesApi = createApiCall("connecteddatabases", GET);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

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
        {/* Chat Header */}
        <div id="chat-header" className="chat-header">
          <div className="bg-light m-2 p-2 border rounded d-flex align-items-center">
            {dataSources && dataSources.length > 0 ? (
              <>
                <FontAwesomeIcon className="ms-auto me-2" icon={faDatabase} />
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
              <p className="ms-auto m-0">
                Welcome to <span className="text-green">Agino</span>. Connect a
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
          className="chat-body overflow-auto mx-2 mb-2 rounded flex-grow-1 border"
        ></div>

        {/* Chat Input */}
        <div id="chat-input" className="chat-input">
          <div className="mx-2 mb-2 rounded border d-flex bg-light align-items-center">
            <span
              className="sendButton p-2"
              onClick={() => navigate("/datasource")}
            >
              <FontAwesomeIcon icon={faDatabase} />
            </span>
            <input
              type="text"
              value={isHistoricChat ? "" : chat}
              onChange={(e) => setChat(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-100 border rounded p-1"
              placeholder={
                // disabled
                //   ? "Start a new chat to begin talking with your database."
                "Start typing here"
              }
              //   disabled={disabled}
            />
            <span onClick={handleNewMessage}>
              <FontAwesomeIcon
                className="fx2 sendButton p-2 me-1"
                icon={faPaperPlane}
              />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatMainContent;
