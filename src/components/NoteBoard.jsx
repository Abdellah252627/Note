import { useState, useEffect, useMemo } from 'react';
import Note from './Note';
import PropTypes from 'prop-types';
import './NoteBoard.css';

const NoteBoard = ({ darkMode, toggleDarkMode }) => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Load notes from localStorage on component mount
  useEffect(() => {
    // Use a flag to track if we've already set notes
    let notesSet = false;

    try {
      // Only try to access localStorage if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedNotes = localStorage.getItem('stickyNotes');

        if (savedNotes) {
          try {
            const parsedNotes = JSON.parse(savedNotes);
            if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
              setNotes(parsedNotes);
              notesSet = true;
            }
          } catch (error) {
            console.error('Error parsing saved notes:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    // If we haven't set notes yet, create a default note
    if (!notesSet) {
      createDefaultNote();
    }
  }, []);

  // Create a default note
  const createDefaultNote = () => {
    // Use safe defaults for window dimensions
    let boardWidth = 800;
    let boardHeight = 600;

    // Only access window after component is mounted
    if (typeof window !== 'undefined') {
      boardWidth = window.innerWidth - 250;
      boardHeight = window.innerHeight - 250;
    }

    const centerX = Math.floor(boardWidth / 2 - 100); // Center the note (note width is 200px)
    const centerY = Math.floor(boardHeight / 2 - 100); // Center the note (note height is ~200px)

    const defaultNote = {
      id: Date.now().toString(),
      text: '<h3>Welcome to Keep Writing!</h3><p>This is a <strong>rich text</strong> note taking app.</p><ul><li>Click to edit this note</li><li>Drag the header to move it</li><li>Use the color picker to change its color</li><li>Drag the bottom-right corner to resize</li><li>Click the tag icon to add tags</li></ul>',
      position: { x: centerX, y: centerY },
      color: '#f7e98d',
      size: { width: 250, height: 250 },
      tags: ['welcome', 'tutorial'],
    };

    setNotes([defaultNote]);
  };

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    // Only save if notes is not empty and we're in a browser environment
    if (notes.length > 0 && typeof window !== 'undefined' && window.localStorage) {
      try {
        const notesString = JSON.stringify(notes);
        localStorage.setItem('stickyNotes', notesString);
      } catch (error) {
        console.error('Error saving notes to localStorage:', error);
      }
    }
  }, [notes]);

  // Add a new note
  const addNote = () => {
    // Generate a random position within the visible area of the board
    // Use safe defaults for window dimensions
    let boardWidth = 800;
    let boardHeight = 600;

    // Only access window after component is mounted
    if (typeof window !== 'undefined') {
      boardWidth = window.innerWidth - 250; // Account for note width
      boardHeight = window.innerHeight - 250; // Account for note height
    }

    const randomX = Math.floor(Math.random() * boardWidth);
    const randomY = Math.floor(Math.random() * boardHeight);

    const newNote = {
      id: Date.now().toString(),
      text: '<h3>New Note</h3><p>Start typing here...</p>',
      position: { x: randomX, y: randomY },
      color: getRandomColor(),
      size: { width: 250, height: 250 },
      tags: [],
    };

    // console.log('Adding new note:', newNote);

    // Fix: Use a callback function to ensure we're using the latest state
    setNotes(prevNotes => [...prevNotes, newNote]);
  };

  // Delete a note
  const deleteNote = (id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  // Update a note
  const updateNote = (id, text, position, color, size, tags) => {
    setNotes(prevNotes => prevNotes.map(note =>
      note.id === id ? { ...note, text, position, color, size, tags } : note
    ));
  };

  // Generate a random pastel color
  const getRandomColor = () => {
    const colors = [
      '#f7e98d', // Yellow
      '#fdceb9', // Peach
      '#b4f0a7', // Green
      '#a7def0', // Blue
      '#e2a7f0', // Purple
      '#f0a7a7', // Pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    // Safely extract tags from notes
    const allTagsArray = notes
      .filter(note => Array.isArray(note.tags))
      .flatMap(note => note.tags);

    // Get unique tags and sort them
    return [...new Set(allTagsArray)].sort();
  }, [notes]);

  // Filter notes based on search term and selected tag
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Skip invalid notes
      if (!note || typeof note !== 'object') {
        return false;
      }

      // Handle text search safely
      let matchesSearch = true;
      if (searchTerm.trim() !== '') {
        // If note.text is not a string or is empty, it won't match the search
        matchesSearch = typeof note.text === 'string' &&
          note.text.toLowerCase().includes(searchTerm.toLowerCase());
      }

      // Handle tag filtering safely
      const matchesTag = !selectedTag ||
        (Array.isArray(note.tags) && note.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  // Handle tag selection
  const handleTagSelect = (tag) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Export notes as JSON file
  const exportNotes = () => {
    // Create a blob with the notes data
    const notesData = JSON.stringify(notes, null, 2);
    const blob = new Blob([notesData], { type: 'application/json' });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `keep-writing-notes-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="note-board">
      <div className="control-panel">
        <div className="left-controls">
          <h1>Keep Writing</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="tags-filter">
              <div className="tags-filter-label">Filter by tag:</div>
              <div className="tags-filter-list">
                {allTags.map((tag, index) => (
                  <button
                    key={index}
                    className={`tag-filter-btn ${selectedTag === tag ? 'active' : ''}`}
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTag && (
                  <button
                    className="clear-tag-filter-btn"
                    onClick={() => setSelectedTag('')}
                    title="Clear tag filter"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="right-controls">
          <button
            className="theme-toggle-btn"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="save-notes-btn" onClick={exportNotes} title="Save notes to file">
            💾 Save Notes
          </button>
          <button className="add-note-btn" onClick={addNote}>
            + Add Note
          </button>
        </div>
      </div>
      <div className="notes-container">
        {filteredNotes.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            No notes found. Click "Add Note" to create one.
          </div>
        ) : (
          filteredNotes.map(note => {
            // Validate note properties before rendering
            if (!note || typeof note !== 'object' || !note.id) {
              return null; // Skip invalid notes
            }

            return (
              <Note
                key={note.id}
                id={note.id}
                initialText={note.text || ''}
                initialPosition={note.position || { x: 0, y: 0 }}
                initialColor={note.color || '#f7e98d'}
                initialSize={note.size || { width: 250, height: 250 }}
                initialTags={Array.isArray(note.tags) ? note.tags : []}
                onDelete={deleteNote}
                onUpdate={updateNote}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

NoteBoard.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
};

export default NoteBoard;
