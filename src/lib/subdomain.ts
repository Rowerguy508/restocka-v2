import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Get current hostname
const getHostname = () => {
  return window.location.hostname;
};

// Determine app mode based on hostname
type AppMode = 'landing' | 'login' | 'app';

const getAppMode = (): AppMode => {
  const hostname = window.location.hostname;
  
  if (hostname === 'app.restocka.app') {
    return 'app';
  }
  if (hostname === 'login.restocka.app') {
    return 'login';
  }
  return 'landing';
};

export { getHostname, getAppMode };
