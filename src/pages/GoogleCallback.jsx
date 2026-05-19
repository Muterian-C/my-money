import { useEffect } from 'react';

export default function GoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      if (window.opener) {
        window.opener.postMessage({ type: 'google_auth_error', error: error || 'no_code' }, window.location.origin);
        window.close();
      } else {
        window.location.href = '/?error=' + (error || 'no_code');
      }
      return;
    }

    // Exchange the code for a token via your backend
    fetch('https://muterian.pythonanywhere.com/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          if (window.opener) {
            window.opener.postMessage(
              { type: 'google_auth_success', token: data.access_token, user: data.user },
              window.location.origin
            );
            window.close();
          }
        } else {
          throw new Error(data.error || 'No token received');
        }
      })
      .catch(err => {
        if (window.opener) {
          window.opener.postMessage({ type: 'google_auth_error', error: err.message }, window.location.origin);
          window.close();
        }
      });
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
