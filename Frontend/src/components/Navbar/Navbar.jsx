import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/authSlice"; // adjust path if needed
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // access auth state
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        AI Marketplace
      </div>
      <ul className="nav-links">
        <li><Link to="/add-product">Product Add</Link></li>
        <li><Link to="/product-review">Product Review</Link></li>
        <li><Link to="/ai-product-review">AI Product Review</Link></li>
        <li><Link to="/ai-content">AI Content</Link></li>
        {/* <li><Link to="/ai-story">AI Story</Link></li> */}
      </ul>

      <div className="auth-section">
        {user ? (
          <>
            <button
              className="profile-btn"
              onClick={() => navigate("/profile")}
            >
              {user.name || "Profile"}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;