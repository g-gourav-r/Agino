import { React, useEffect, useState } from "react";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import createApiCall, { GET } from "../api/api";

function ChatSidebar({ setChatID }) {
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);

  const fetchChatHistory = createApiCall("chatHistory", GET);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  const clearCurrentChatHistory = () => {
    const appData = JSON.parse(localStorage.getItem("appData")) || {};

    if (appData.chatData) {
      delete appData.chatData.selectedDataSource;
      delete appData.chatData.sessionID;
    }

    localStorage.setItem("appData", JSON.stringify(appData));
  };

  useEffect(() => {
    if (!token) return;

    setLoading(true);

    fetchChatHistory({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        setChats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  }, []);

  return (
    <div className="d-flex flex-grow-1 flex-column h-100">
      <div className="text-center m-2">
        <button
          className="w-100 btn-green rounded"
          onClick={() => {
            setChatID(null); // Temporarily reset chatID
            setTimeout(() => setChatID("new_chat"), 0); // Re-set to "new_chat"
          }}
        >
          Start a New Chat
        </button>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <MutatingDotsLoader />
        </div>
      ) : chats.length > 0 ? (
        <div className="notes-list m-2">
          {/* Render list of notes */}
          {chats.map((chat, index) => (
            <button
              key={index}
              id={chat._id}
              className="w-100 rounded border-bottom btn-outline note-item mb-2"
              onClick={() => {
                setChatID(chat._id);
                clearCurrentChatHistory();
              }}
            >
              <div
                className="px-1 fs-8 text-truncate text-start"
                style={{ fontSize: "0.9rem" }}
              >
                {chat.input} <br />
                <small style={{ fontSize: "0.65rem", color: "grey" }}>
                  {new Date(chat.startTime).toLocaleString()}
                </small>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-black">
          Start your great experience with Agino. Begin now!
        </div>
      )}
    </div>
  );
}

export default ChatSidebar;
