import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Detect device language and set locale
const getDeviceLanguage = (): string => {
  // Check browser language
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  // Map browser languages to supported locales
  if (browserLang.startsWith('es') || browserLang.startsWith('sp')) {
    return 'es';
  }
  return 'en'; // Default to English
};

// Set the locale for the app
const locale = getDeviceLanguage();
localStorage.setItem('restocka_locale', locale);

createRoot(document.getElementById("root")!).render(<App />);
