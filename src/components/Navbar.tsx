import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // ignore sign out errors
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        the clothing shop
      </Link>
      <div className="navbar-links">
        <Link to="/home">Browse</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/listings/new">New Listing</Link>
            <button onClick={handleSignOut}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
