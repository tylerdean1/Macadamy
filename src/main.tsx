import { StrictMode } from 'react'; // Import React's StrictMode for highlighting potential problems in an application
import { createRoot } from 'react-dom/client'; // Import createRoot for rendering React components
import App from './App.tsx'; // Import the main App component
import './index.css'; // Import global CSS styles

/** 
 * Main entry point for the application.
 * 
 * This file sets up the React application by rendering
 * the main App component into the DOM. It uses StrictMode 
 * to enable additional checks and warnings for potential 
 * issues in components. The global styles are applied 
 * to ensure a consistent look throughout the application.
 */

// Create a root element for rendering
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> {/* Render the main App component */}
  </StrictMode>
);