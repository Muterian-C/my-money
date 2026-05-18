import { useEffect } from 'react';

export default function GoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      console.error('Google auth error:', error);
      window.location.href = '/auth?error=' + error;
      return;
    }
    
    if (token) {
      console.log('Google auth successful, saving token');
      localStorage.setItem('token', token);
      // Redirect to dashboard immediately
      window.location.href = '/dashboard';
    } else {
      console.error('No token received');
      window.location.href = '/auth?error=no_token';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing Google sign in...</p>
        <p className="text-xs text-gray-500 mt-2">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
