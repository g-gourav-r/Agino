import React from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import ChatComponent from "../components/ChatWindow";
import { Container } from "reactstrap";
import "../assets/css/ConversationWindow.css";

const ConversationWindow = () => {
  return (
    <main className="full-layout">
      {/********Header**********/}
      <Header />
      <div className="page-wrapper">
        {/********Sidebar**********/}
        <aside className="sidebar-area shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        {/********Content Area**********/}
        <div className="content-area">
          {/********Middle Content**********/}
          <Container className="p-0" fluid>
            <ChatComponent />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default ConversationWindow;
