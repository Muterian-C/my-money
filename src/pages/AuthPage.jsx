export default function AuthPage({ onLogin }) {
  return (
    <div className="page">
      <h1>Login</h1>

      <button onClick={onLogin}>
        Demo Login
      </button>
    </div>
  );
}