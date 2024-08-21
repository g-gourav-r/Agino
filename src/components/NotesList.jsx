import React, { useState, useEffect } from "react";
import { Button, Nav, NavItem, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import user from "../assets/images/user.jpg";
import userBanner from "../assets/images/UserBanner.jpg";

const NotesList = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true); // State for loading
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch notes from the API
        const fetchNotes = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/notes');
                setNotes(response.data);
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setLoading(false); // Stop loading after the request is complete
            }
        };

        fetchNotes();
    }, []);

    const showMobilemenu = () => {
        document.getElementById("sidebarArea").classList.toggle("showSidebar");
    };

    const handleNoteClick = (noteId) => {
        navigate(`/notes/note/${noteId}`); // Navigate to the NoteEditor with the note ID
    };

    const handleAddNewNote = () => {
        navigate('/notes/create'); // Navigate to the NoteEditor without an ID
        // Force a reload of the NoteEditor component
        window.location.reload();
    };

    return (
        <div className="sidebar-container">
            <div
                className="profilebg"
                style={{ background: `url(${userBanner}) no-repeat` }}
            >
                <div className="p-3 d-flex">
                    <img src={user} alt="user" width="50" className="rounded-circle" />
                    <Button
                        color="white"
                        className="ms-auto text-white d-lg-none"
                        onClick={showMobilemenu}
                    >
                        <i className="bi bi-x"></i>
                    </Button>
                </div>
                <div className="bg-dark text-white p-2 opacity-75">Gourav R</div>
            </div>
            <div className="d-flex align-items-center w-100 my-2">
                <Button
                    color="primary"
                    className="add-button w-100"
                    onClick={handleAddNewNote}
                >
                    <i className="bi bi-plus"></i> Add New Note
                </Button>
            </div>
            <div className="p-3 my-2 py-4 bg-light sidebar-content" style={{ height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                        <Spinner color="primary" />
                    </div>
                ) : (
                    <Nav vertical className="sidebarNav">
                        {notes.length > 0 ? (
                            notes.map((note) => (
                                <NavItem key={note._id} className="mb-2">
                                    <Button
                                        color="light"
                                        className="sidebar-button w-100 text-start"
                                        onClick={() => handleNoteClick(note._id)}
                                    >
                                        {note.title}
                                    </Button>
                                </NavItem>
                            ))
                        ) : (
                            <div>No notes available</div>
                        )}
                    </Nav>
                )}
            </div>
        </div>
    );
};

export default NotesList;
