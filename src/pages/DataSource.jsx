import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import DatabaseConfig from "../components/DatabaseConfig";
import { Container } from "reactstrap";
import "../assets/css/ConversationWindow.css";
import SideBarBlank from "../components/SideBarBlank";

const DataSource = () => {
  return (
    <main className="full-layout">
      {/********Header**********/}
      <Header />
      <div className="page-wrapper">
        {/********Sidebar**********/}
        <aside className="sidebar-area shadow" id="sidebarArea">
          <SideBarBlank />
        </aside>
        {/********Content Area**********/}
        <div className="content-area">
          {/********Middle Content**********/}
          <Container className="p-0" fluid>
            <DatabaseConfig />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default DataSource;
