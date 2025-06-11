import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import PropTypes from 'prop-types';
import 'react-resizable/css/styles.css';
import './Note.css';

// Import ReactQuill CSS directly
import 'react-quill/dist/quill.snow.css';

// Lazy load ReactQuill for better performance
const ReactQuill = lazy(() => import('react-quill'));

const Note = ({ id, initialText, initialPosition, initialColor, initialSize, initialTags, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [text, setText] = useState(initialText || 'New Note');
  const [color, setColor] = useState(initialColor || '#f7e98d');
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  const [size, setSize] = useState(initialSize || { width: 200, height: 200 });
  const [tags, setTags] = useState(initialTags || []);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef(null);
  const nodeRef = useRef(null); // Add a reference for the Draggable component

  // console.log('Note rendering with:', { id, initialText, initialPosition, initialColor });

  // Focus the textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Handle drag stop event
  const handleDragStop = (_, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    onUpdate(id, text, newPosition, color, size, tags);
  };

  // Handle resize event
  const handleResize = (_, { size: newSize }) => {
    setSize(newSize);
    onUpdate(id, text, position, color, newSize, tags);
  };

  // Handle text change
  const handleTextChange = (value) => {
    setText(value);
  };

  // Handle color change
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    onUpdate(id, text, position, newColor, size, tags);
  };

  // Save note content when editing is done
  const handleSave = () => {
    setIsEditing(false);
    onUpdate(id, text, position, color, size, tags);
  };

  // Handle delete button click
  const handleDelete = () => {
    onDelete(id);
  };

  // Toggle tags editing mode
  const toggleTagsEditing = () => {
    setIsEditingTags(!isEditingTags);
  };

  // Handle tag input change
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add a new tag
  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
      onUpdate(id, text, position, color, size, newTags);
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onUpdate(id, text, position, color, size, newTags);
  };

  // Use Draggable and Resizable for the note
  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={handleDragStop}
      bounds="parent"
      handle=".note-header"
    >
      <div ref={nodeRef}>
        <Resizable
          width={size.width}
          height={size.height}
          onResize={handleResize}
          minConstraints={[150, 150]}
          maxConstraints={[500, 500]}
          handle={
            <div className="resize-handle">
              <span className="resize-icon">⤡</span>
            </div>
          }
        >
          <div
            className="note"
            style={{
              backgroundColor: color,
              width: `${size.width}px`,
              height: `${size.height}px`
            }}
          >
            <div className="note-header">
              <div className="note-controls">
                <input
                  type="color"
                  value={color}
                  onChange={handleColorChange}
                  className="color-picker"
                  title="Change note color"
                />
                <button
                  className="tags-btn"
                  onClick={toggleTagsEditing}
                  title="Manage tags"
                >
                  🏷️
                </button>
              </div>
              <button className="delete-btn" onClick={handleDelete} title="Delete note">
                ×
              </button>
            </div>

            {isEditingTags && (
              <div className="tags-editor">
                <form onSubmit={addTag}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    placeholder="Add a tag..."
                    className="tag-input"
                  />
                  <button type="submit" className="add-tag-btn">Add</button>
                </form>
                <div className="tags-list">
                  {tags.map((tag, index) => (
                    <div key={index} className="tag">
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="remove-tag-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag-badge">{tag}</span>
              ))}
            </div>
            <div className="note-content">
              {isEditing ? (
                <div className="editor-container">
                  <Suspense fallback={<div className="loading-editor">Loading editor...</div>}>
                    <ReactQuill
                      theme="snow"
                      value={text}
                      onChange={handleTextChange}
                      onBlur={handleSave}
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link'],
                          ['clean']
                        ]
                      }}
                    />
                  </Suspense>
                  <button className="done-btn" onClick={handleSave}>
                    Done
                  </button>
                </div>
              ) : (
                <div
                  className="note-text"
                  onClick={() => setIsEditing(true)}
                >
                  {typeof text === 'string' && text.trim() !== '' ? (
                    <div dangerouslySetInnerHTML={{ __html: text }} />
                  ) : (
                    <p>Click to edit this note</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
};

Note.propTypes = {
  id: PropTypes.string.isRequired,
  initialText: PropTypes.string,
  initialPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  initialColor: PropTypes.string,
  initialSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  initialTags: PropTypes.arrayOf(PropTypes.string),
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default Note;
