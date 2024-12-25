import React, { useEffect, useState, useRef, useCallback } from "react";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import createApiCall, { GET } from "../api/api";

function ChatSidebar({ setChatID }) {
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchChatHistory = createApiCall("chatHistory", GET);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  // Clear current chat history in localStorage
  const clearCurrentChatHistory = () => {
    const appData = JSON.parse(localStorage.getItem("appData")) || {};

    if (appData.chatData) {
      delete appData.chatData.selectedDataSource;
      delete appData.chatData.sessionID;
    }

    localStorage.setItem("appData", JSON.stringify(appData));
  };

  // Fetch chat history with pagination
  const fetchChats = useCallback(async () => {
    if (!token || loading || !hasMore) return;

    setLoading(true);

    try {
      const skip = chats.length; // Use the current number of chats as the skip value
      const response = await fetchChatHistory({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        urlParams: { skip, limit: 10 },
      });

      const newChats = response.data;
      setChats((prevChats) => [...prevChats, ...newChats]);

      // If fewer chats are returned than requested, stop fetching
      setHasMore(newChats.length === 10);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token, loading, hasMore, chats, fetchChatHistory]);

  // Call fetchChats on initial load
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // IntersectionObserver to detect when last chat item is visible
  const lastChatRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchChats();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchChats]
  );

  return (
    <div className="d-flex flex-grow-1 flex-column h-100">
      {/* Start New Chat Button */}
      <div className="text-center m-2 sticky-top">
        <button
          className="w-100 btn-green rounded"
          onClick={() => {
            setChatID(null);
            setTimeout(() => setChatID("new_chat"), 0);
            clearCurrentChatHistory();
          }}
        >
          Start a New Chat
        </button>
      </div>

      {/* Chat List */}
      {loading && chats.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <MutatingDotsLoader />
        </div>
      ) : chats.length > 0 ? (
        <div className="notes-list m-2">
          {chats.map((chat, index) => {
            const isLastItem = index === chats.length - 1;
            return (
              <button
                key={chat._id}
                id={chat._id}
                ref={isLastItem ? lastChatRef : null} // Attach observer to the last item
                className="w-100 rounded border-bottom btn-outline note-item mb-2"
                onClick={() => {
                  setChatID(chat._id);
                  clearCurrentChatHistory();
                }}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title={`${chat.input}`}
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
            );
          })}
          {/* Loader at the bottom while fetching more chats */}
          {loading && (
            <div className="text-center">
              <MutatingDotsLoader />
            </div>
          )}
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
