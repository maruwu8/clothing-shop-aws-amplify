import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, confirmSignUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      setStep('confirm');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      if (message.includes('UsernameExistsException') || message.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists.');
      } else if (message.includes('InvalidPasswordException') || message.toLowerCase().includes('password')) {
        setError('Password does not meet requirements. Use at least 8 characters with uppercase, lowercase, numbers, and special characters.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode });
      setLoading(false);
      navigate('/login', { replace: true, state: { fromRegistration: true } });
      return;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Confirmation failed.';
      setError(message);
      setLoading(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div className="auth-container">
        <h1>Confirm Account</h1>
        <div className="alert alert-info">
          A confirmation code has been sent to {email}
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleConfirm}>
          <div className="form-group">
            <label htmlFor="code">Confirmation Code</label>
            <input
              id="code"
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1>Register</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
            Min 8 characters, uppercase, lowercase, number, and special character
          </p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
