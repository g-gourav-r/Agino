import WindowTemplate from "../WindowTemplate";
import ChatMainContent from "./ChatMainContent";
import ChatSidebar from "./ChatSidebar";
import { useState } from "react";

function Chat() {
  const [chatID, setChatID] = useState(null);

  return (
    <WindowTemplate
      currentPage={"chat"}
      sideBar={<ChatSidebar setChatID={setChatID} />}
      mainContent={<ChatMainContent selectedChatId={chatID} />}
    />
  );
}

export default Chat;
