import { useState } from 'react';

export default function GoogleLogin({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    
    // Get Google auth URL from backend
    fetch('https://muterian.pythonanywhere.com/api/auth/google')
      .then(res => res.json())
      .then(data => {
        if (data.auth_url) {
          // Open popup for Google login
          const width = 500;
          const height = 600;
          const left = window.screenX + (window.outerWidth - width) / 2;
          const top = window.screenY + (window.outerHeight - height) / 2;
          
          const popup = window.open(
            data.auth_url,
            'Google Login',
            `width=${width},height=${height},left=${left},top=${top}`
          );
          
          // Check popup status periodically
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              setLoading(false);
            }
          }, 500);
          
          // Listen for message from popup
          const handleMessage = async (event) => {
            // Allow messages from your domain
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'google_auth_success') {
              clearInterval(checkPopup);
              window.removeEventListener('message', handleMessage);
              popup?.close();
              
              const { token, user } = event.data;
              if (token) {
                localStorage.setItem('token', token);
                if (onSuccess) onSuccess(user);
                window.location.reload();
              } else {
                if (onError) onError('No token received');
              }
              setLoading(false);
            } else if (event.data.type === 'google_auth_error') {
              clearInterval(checkPopup);
              window.removeEventListener('message', handleMessage);
              popup?.close();
              if (onError) onError(event.data.error);
              setLoading(false);
            }
          };
          
          window.addEventListener('message', handleMessage);
        }
      })
      .catch(err => {
        console.error('Google login error:', err);
        if (onError) onError('Failed to initialize Google login');
        setLoading(false);
      });
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}
