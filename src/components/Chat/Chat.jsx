import WindowTemplate from "../WindowTemplate";
import ChatMainContent from "./ChatMainContent";
import ChatSidebar from "./chatSideBar";

function Chat() {
  return (
    <WindowTemplate
      sideBar={<ChatSidebar />}
      mainContent={<ChatMainContent />}
    />
  );
}

export default Chat;
