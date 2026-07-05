import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Brand />
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to see what's on your plate.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="auth-switch">
          No account yet? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
