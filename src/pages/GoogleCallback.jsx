import { useEffect } from 'react';

export default function GoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'google_auth_error',
          error: error
        }, window.location.origin);
      }
      window.close();
      return;
    }
    
    if (token) {
      // Send success to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'google_auth_success',
          token: token,
          user: {
            id: params.get('user_id'),
            name: params.get('name'),
            email: params.get('email')
          }
        }, window.location.origin);
      }
      window.close();
    } else {
      // No token received
      if (window.opener) {
        window.opener.postMessage({
          type: 'google_auth_error',
          error: 'No authentication token received'
        }, window.location.origin);
      }
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing Google sign in...</p>
        <p className="text-xs text-gray-500 mt-2">This window will close automatically</p>
      </div>
    </div>
  );
}
