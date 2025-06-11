import { useState, useEffect } from 'react'
import './App.css'
import NoteBoard from './components/NoteBoard'

function App() {
  // Use a safer approach to initialize state from localStorage
  const [darkMode, setDarkMode] = useState(false);

  // Initialize darkMode from localStorage after component mounts
  useEffect(() => {
    try {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(savedDarkMode);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);

    // Only save to localStorage after initial render
    try {
      localStorage.setItem('darkMode', darkMode);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="app">
      <NoteBoard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  )
}

export default App
