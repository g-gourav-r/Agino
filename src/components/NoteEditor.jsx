import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [titleClass, setTitleClass] = useState(''); // State for Bootstrap validation class
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);
  const quillInitializedRef = useRef(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (editorContainerRef.current && !quillInitializedRef.current) {
      const existingToolbar = editorContainerRef.current.previousSibling;
      if (existingToolbar && existingToolbar.classList.contains('ql-toolbar')) {
        existingToolbar.remove();
      }

      quillRef.current = new Quill(editorContainerRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['image', 'blockquote', 'code-block'],
            [{ 'align': [] }],
            ['clean']
          ]
        }
      });

      quillInitializedRef.current = true;
    }

    if (id) {
      const fetchNote = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/notes/${id}`);
          setTitle(response.data.title || '');
          if (quillRef.current) {
            quillRef.current.root.innerHTML = response.data.content || '';
          }
        } catch (error) {
          console.error('Error fetching note:', error);
        }
      };
      fetchNote();
    } else {
      setTitle('');
      if (quillRef.current) {
        quillRef.current.root.innerHTML = '';
      }
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
        quillInitializedRef.current = false;
      }
    };
  }, [id, API_BASE_URL]);

  const saveNote = async () => {
    if (!quillRef.current) return;
    const noteContent = quillRef.current.root.innerHTML;

    if (title.trim() === '') {
      setTitleClass('is-invalid'); // Show validation error
      setTimeout(() => {
        setTitleClass(''); // Remove validation class after 3 seconds
      }, 3000);
      return;
    }

    try {
      if (id) {
        await axios.put(`${API_BASE_URL}/notes/${id}`, { title, content: noteContent });
      } else {
        await axios.post(`${API_BASE_URL}/notes`, { title, content: noteContent });
      }
      setTitleClass('is-valid'); // Show success validation class

      setTimeout(() => {
        setTitleClass(''); // Remove validation class after 3 seconds
      }, 3000);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className='p-4'>
      <div className="d-flex align-items-center py-3">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleClass(''); // Reset validation class on change
          }}
          placeholder="Note Title"
          className={`form-control me-2 ${titleClass}`} // Apply Bootstrap validation class
        />
        <button onClick={saveNote} className="btn btn-primary">
          Save
        </button>
      </div>
      <div id="editor-container" ref={editorContainerRef} style={{ height: '70vh' }}></div>
    </div>
  );
};

export default NoteEditor;
