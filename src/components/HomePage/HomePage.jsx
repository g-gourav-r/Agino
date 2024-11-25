import React from "react";
import WindowTemplate from "../WindowTemplate";
import ChatSidebar from "../Chat/chatSideBar";
import DataSourceMainContent from "../DataSource/DataSourceMainContent";
import NotePadSidebar from "../NotePad/NotePadSidebar";
function HomePage() {
  return (
    <WindowTemplate
      sideBar={<ChatSidebar />}
      mainContent={<DataSourceMainContent />}
    />
  );
}

export default HomePage;
