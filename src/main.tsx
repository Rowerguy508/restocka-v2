import React, { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Simple HTML fallback for errors
const renderFallback = () => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="background: #0a0a0f; color: #fff; min-height: 100vh; padding: 40px; font-family: system-ui;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h1 style="color: #22c55e; margin-bottom: 20px;">ReStocka</h1>
          <p style="color: #9ca3af; margin-bottom: 20px;">Loading...</p>
          <button onclick="window.location.reload()" style="background: #22c55e; color: #000; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">
            Reload
          </button>
        </div>
      </div>
    `;
  }
};

// Initialize the app
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    document.body.innerHTML = '<div style="color: white; padding: 20px;">Error: root element not found</div>';
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    renderFallback();
  }
};

initializeApp();
