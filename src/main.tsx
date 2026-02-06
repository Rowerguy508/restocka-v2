import React, { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize the app
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    document.body.innerHTML = '<div style="color: #333; padding: 20px; font-family: system-ui;">Error: root element not found</div>';
    return;
  }

  // Check Supabase env vars
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
  const hasSupabaseConfig = supabaseUrl.length > 0 && supabaseKey.length > 0;

  if (!hasSupabaseConfig) {
    console.warn('Supabase configuration missing - running in demo mode');
  }

  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Fallback error UI
    rootElement.innerHTML = `
      <div style="background: #1a1a1a; color: #e0e0e0; min-height: 100vh; padding: 40px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h1 style="color: #22c55e; margin-bottom: 20px;">ReStocka</h1>
          <p style="color: #f87171; margin-bottom: 20px; font-size: 14px;">
            Error: ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button 
            onclick="window.location.reload()" 
            style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;"
          >
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
};

// Start app initialization after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
