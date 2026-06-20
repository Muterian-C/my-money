import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error('Google auth error:', error);
      navigate('/auth?error=google_failed');
      return;
    }

    if (!token) {
      console.error('No token found in callback URL');
      navigate('/auth?error=no_token');
      return;
    }

    // Save token and reload to trigger auth check
    console.log('✅ Google auth successful, saving token...');
    localStorage.setItem('token', token);
    
    // Navigate to dashboard after a small delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 200);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Completing Google sign in...</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Please wait while we log you in</p>
      </div>
    </div>
  );
}
