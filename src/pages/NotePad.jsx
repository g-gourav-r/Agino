import React from "react";
import { Outlet } from "react-router-dom";
import NotesList from "../components/NotesList";  
import Header from "../components/Header";
import { Container } from "reactstrap";
import "../assets/css/NotePad.css";

const NotePad = () => {
  return (
    <main className="full-layout">
      {/********Header**********/}
      <Header />
      <div className="page-wrapper">
        {/********Sidebar**********/}
        <aside className="sidebar-area shadow" id="sidebarArea">
          <NotesList />
        </aside>
        {/********Content Area**********/}
        <div className="content-area">
          {/********Middle Content**********/}
          <Container className="p-0" fluid>
            <Outlet /> {/* Render the NoteEditor here */}
          </Container>
        </div>
      </div>
    </main>
  );
};

export default NotePad;
