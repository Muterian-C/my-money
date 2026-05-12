export default function LandingPage({ onGetStarted }) {
  return (
    <div className="page">
      <h1>PesaPlan</h1>
      <p>Personal finance for African professionals.</p>

      <button onClick={onGetStarted}>
        Get Started
      </button>
    </div>
  );
}