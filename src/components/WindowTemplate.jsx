import React, { useState, useRef, useEffect } from "react";
import FeedbackModal from "./FeedbackModal/FeedbackModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function WindowTemplate({ currentPage, sideBar, mainContent }) {
  const navigate = useNavigate();
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isFeedbackVisible, setFeedbackVisible] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const openFeedback = () => {
    setFeedbackVisible(true);
  };

  const closeFeedback = () => {
    setFeedbackVisible(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("appData");
    navigate("/login");
  };

  useEffect(() => {
    // Calculate the navbar height dynamically when component mounts or when the navbar changes
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const updateViewportHeight = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    updateViewportHeight(); // Set on initial load
    window.addEventListener("resize", updateViewportHeight); // Update on resize

    return () => {
      window.removeEventListener("resize", updateViewportHeight); // Cleanup
    };
  }, []);

  return (
    <div
      className="container-fluid vh-100 vw-100 background-image p-2 d-flex flex-column"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      <nav
        id="navigation-bar"
        ref={navbarRef}
        className="navbar navbar-expand-lg d-flex justify-content-between p-0 border rounded"
      >
        <div className="container-fluid header">
          <span className="brandName">Agino</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a
                  className={`px-2 nav-link user-select-none ${
                    currentPage === "chat" ? "active" : ""
                  }`}
                  aria-current="page"
                  onClick={() => navigate("/chat")}
                >
                  Chat
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="px-2 nav-link disabled user-select-none"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Reports
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`px-2 nav-link user-select-none ${
                    currentPage === "dashboard" ? "active" : ""
                  }`}
                  aria-current="page"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`px-2 nav-link user-select-none ${
                    currentPage === "notepad" ? "active" : ""
                  }`}
                  aria-current="page"
                  onClick={() => navigate("/notepad")}
                >
                  Notepad
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`px-2 nav-link user-select-none${
                    currentPage === "data-source" ? "active" : ""
                  }`}
                  onClick={() => navigate("/datasource")}
                >
                  Data Source
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="row g-0 d-flex flex-grow-1 py-1">
        {/* Sidebar */}
        <div
          className={`sideBar border rounded flex-column ${
            isSidebarOpen ? "d-flex col-6" : "col-2 d-none d-lg-flex"
          }`}
          style={{
            height: `calc(97vh - ${navbarHeight}px)`,
            transition: "transform 0.3s ease",
          }}
        >
          <div
            className="m-1 border rounded flex-grow-1"
            style={{ overflowY: "auto" }}
          >
            {sideBar}
          </div>
          <div className="m-1 d-flex">
            <button
              className="btn-green rounded p-1 w-50 mx-1"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              className="btn-green rounded p-1 w-50 mx-1"
              onClick={openFeedback}
            >
              Feedback
            </button>
          </div>
        </div>

        {/* Sidebar Toggle Button (Visible on Mobile) */}
        <button
          className="d-lg-none position-absolute top-auto start-0  py-5"
          onClick={toggleSidebar}
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1050,
            backgroundColor: "#28a745",
            border: "none",
            width: "auto",
            borderRadius: "0px 200px 200px 0px",
          }}
        >
          <FontAwesomeIcon
            icon={faArrowRight}
            style={{
              transition: "transform 0.3s ease-in-out", // Smooth rotation animation
              transform: isSidebarOpen ? "rotate(180deg)" : "rotate(0deg)",
              color: "white",
            }}
          />
        </button>

        {/* Main Content */}
        <div
          className="col-lg-10 col-6 mainContent d-flex flex-grow-1"
          style={{ height: `calc(97vh - ${navbarHeight}px)` }}
        >
          <div
            className="ms-1 border rounded w-100"
            style={{ overflowY: "auto" }}
          >
            {mainContent}
          </div>
        </div>
      </div>
      {/* Feedback Modal */}
      <FeedbackModal isVisible={isFeedbackVisible} onClose={closeFeedback} />
    </div>
  );
}

export default WindowTemplate;
