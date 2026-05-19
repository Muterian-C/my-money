import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback({ onLogin }) {
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error || !token) {
      window.location.href = '/?auth_error=' + (error || 'no_token');
      return;
    }

    // Save token and load user
    localStorage.setItem('token', token);
    
    // Clean the URL then trigger app to re-check auth
    window.history.replaceState({}, document.title, '/');
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing Google sign in...</p>
      </div>
    </div>
  );
}
