import { StrictMode, Suspense, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error boundary component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <p>The application encountered an error. Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Make sure the DOM is ready before rendering
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);

    root.render(
      <ErrorBoundary>
        <StrictMode>
          <Suspense fallback={<div className="loading">Loading application...</div>}>
            <App />
          </Suspense>
        </StrictMode>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error rendering React application:', error);

    // Fallback for critical errors
    rootElement.innerHTML = `
      <div class="error-container">
        <h2>Failed to load application</h2>
        <p>Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
}
