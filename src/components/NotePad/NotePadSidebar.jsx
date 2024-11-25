import { React, useEffect, useState } from "react";
import MutatingDotsLoader from "../Loaders/MutatingDots";
import createApiCall, { GET } from "../api/api";

function NotePadSidebar({ refreshNotesSideBar, setNoteID }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);

  const fetchAllNotes = createApiCall("api/notes", GET);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  useEffect(() => {
    if (!token) return;

    setLoading(true);

    fetchAllNotes({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        setNotes(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  }, [refreshNotesSideBar]);

  //   handleNoteSelection(() => {
  //     alert("clicked");
  //   });

  return (
    <div className="d-flex flex-grow-1 flex-column h-100">
      <div className="text-center m-2">
        <button
          className="w-100 btn-green rounded"
          onClick={() => setNoteID("new_note")}
        >
          Start a New Note
        </button>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <MutatingDotsLoader />
        </div>
      ) : notes.length > 0 ? (
        <div className="notes-list m-2">
          {/* Render list of notes */}
          {notes.map((note) => (
            <div
              key={note._id}
              id={note._id}
              className="w-100 rounded btn-outline border-bottom note-item p-1 mb-2"
              onClick={() => setNoteID(note._id)}
            >
              <p className="p-0 m-0">{note.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-black">
          Start your great experience with notes. Begin now!
        </div>
      )}
    </div>
  );
}

export default NotePadSidebar;
