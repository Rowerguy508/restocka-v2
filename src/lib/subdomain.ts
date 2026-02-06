// Subdomain-based routing utilities

// Get current hostname - handles SSR, edge cases, and host headers
const getHostname = (): string => {
  if (typeof window === 'undefined') {
    return 'restocka.app'; // Default for SSR
  }
  
  // Check for manually set host (useful for testing)
  const manualHost = (window as any).__MANUAL_HOST__;
  if (manualHost) return manualHost;
  
  return window.location.hostname || 'restocka.app';
};

// Determine app mode based on hostname
type AppMode = 'landing' | 'login' | 'app';

const getAppMode = (): AppMode => {
  const hostname = getHostname().toLowerCase();
  
  if (hostname === 'app.restocka.app') {
    return 'app';
  }
  if (hostname === 'login.restocka.app') {
    return 'login';
  }
  // restocka.app, www.restocka.app, or any other subdomain
  return 'landing';
};

// Get the base URL for the current mode
const getBaseUrl = (): string => {
  const mode = getAppMode();
  switch (mode) {
    case 'app':
      return 'https://app.restocka.app';
    case 'login':
      return 'https://login.restocka.app';
    default:
      return 'https://restocka.app';
  }
};

// Redirect helpers
const redirectTo = (path: string, replace = true): void => {
  if (typeof window === 'undefined') return;
  
  const mode = getAppMode();
  const baseUrl = getBaseUrl();
  
  // For app subdomain, keep everything under /app
  if (mode === 'app' && !path.startsWith('/app') && !path.startsWith('http')) {
    window.location.href = `/app${path.startsWith('/') ? path : '/' + path}`;
    return;
  }
  
  window.location.href = `${baseUrl}${path}`;
};

// Check if running on a specific subdomain
const isSubdomain = (subdomain: string): boolean => {
  return getHostname().startsWith(`${subdomain}.`);
};

// Get clean path without subdomain prefix
const getCleanPath = (): string => {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname;
};

export { 
  getHostname, 
  getAppMode, 
  getBaseUrl, 
  redirectTo,
  isSubdomain,
  getCleanPath 
};
