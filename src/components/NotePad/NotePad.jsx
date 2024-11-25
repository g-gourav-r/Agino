import { React, useState } from "react";
import WindowTemplate from "../WindowTemplate";
import NotePadSidebar from "./NotePadSidebar";
import NotePadMainContent from "./NotePadMainContent";

function NotePad() {
  const [refreshNotesSideBar, setRefresh] = useState(false);
  const [noteID, setNoteID] = useState(null);

  const handleNoteSelect = (noteId) => {
    setNoteID(noteId);
  };

  return (
    <WindowTemplate
      currentPage={"notepad"}
      sideBar={
        <NotePadSidebar
          refreshNotesSideBar={refreshNotesSideBar}
          setNoteID={handleNoteSelect}
        />
      }
      mainContent={
        <NotePadMainContent setRefresh={setRefresh} noteID={noteID} />
      }
    />
  );
}

export default NotePad;
