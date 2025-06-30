import { Link, useNavigate } from "react-router-dom";
// import { useTheme } from "./ThemeContext";
import "./Navbar.css";
import { FaMoon, FaSun } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="nav-container">
      <div className="navbar-content">
        <div className="navbar-logo">
          <span className="logo-icon" role="img" aria-label="logo">📝</span>
          <span className="logo-text">BlogSpace</span>
        </div>
        <div className="nav-list">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/create" className="nav-link">Create Post</Link>
          <Link to="/myposts" className="nav-link">My Posts</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </div>
        <div className="navbar-actions">
          {token ? (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-outline">Login</Link>
              <Link to="/register" className="nav-btn nav-btn-filled">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
