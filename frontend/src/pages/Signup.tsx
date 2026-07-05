import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError("That email is already registered.");
      } else {
        setError("Could not create your account. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Brand />
        <h1>Create your account</h1>
        <p className="auth-subtitle">Takes ten seconds. No spam, ever.</p>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
