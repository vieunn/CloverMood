import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="page">
      <div className="card">
        <h1>Dashboard</h1>
        <p className="muted">You are logged in.</p>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" to="/login">Back to Login</Link>
          <Link className="btn ghost" to="/register">Back to Register</Link>
        </div>
      </div>
    </div>
  );
}