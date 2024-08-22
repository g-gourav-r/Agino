import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Button, NavDropdown, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faEllipsisV, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/css/Header.css";

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);
  const handleToggle = () => setIsOpen(!isOpen);
  const showMobileMenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  return (
    <Navbar bg="primary" variant="dark" expand="md" className="fix-header">
      <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
        <div className="d-lg-block d-none me-5 pe-3">
          <div className="logo-name px-3">
            <h4>Agino</h4>
          </div>
        </div>
        <FontAwesomeIcon icon={faUserCircle} size="2x" color="white" className="d-lg-none" />
      </Navbar.Brand>

      <Button
        variant="primary"
        className="d-lg-none"
        onClick={showMobileMenu}
      >
        <FontAwesomeIcon icon={faBars} />
      </Button>

      <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-sm-block d-md-none" onClick={handleToggle}>
        {isOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faEllipsisV} />}
      </Navbar.Toggle>

      <Navbar.Collapse id="basic-navbar-nav" className={isOpen ? "show" : ""}>
        <Nav className="mx-auto">
          <Nav.Link as={Link} to="/chat">Home</Nav.Link>
          <Nav.Link as={Link} to="/">Reports</Nav.Link>
          <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
          <Nav.Link as={Link} to="/notes/">NoteEditor</Nav.Link>
          <NavDropdown title="Data Source" id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">MongoDB</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">Mysql</NavDropdown.Item>
          </NavDropdown>
        </Nav>

        <Dropdown show={dropdownOpen} onClick={toggleDropdown} align="end" className="ms-3 px-4">
          <Dropdown.Toggle variant="link" id="dropdown-basic">
            <FontAwesomeIcon icon={faUserCircle} size="2x" color="white" className="px-1"/>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-right">
            <Dropdown.Header>Info</Dropdown.Header>
            <Dropdown.Item href="#/action-1">My Account</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Edit Profile</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="#/action-5">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
