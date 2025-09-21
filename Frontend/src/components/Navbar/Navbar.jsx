import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/authSlice";
import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        AI Marketplace
      </div>

      <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <div className={`menu-container ${isMenuOpen ? "show-menu" : ""}`}>
        <ul className="nav-links">
          <li>
            <Link to="/add-product" onClick={handleLinkClick}>
              Product Add
            </Link>
          </li>
          <li>
            <Link to="/product-review" onClick={handleLinkClick}>
              Product Review
            </Link>
          </li>
          <li>
            <Link to="/ai-product-review" onClick={handleLinkClick}>
              AI Product Review
            </Link>
          </li>
          <li>
            <Link to="/ai-content" onClick={handleLinkClick}>
              AI Content
            </Link>
          </li>
          <li>
            <Link to="/ai-story" onClick={handleLinkClick}>
              AI Story
            </Link>
          </li>
        </ul>

        <div className="auth-section">
          {user ? (
            <>
              <button
                className="profile-btn"
                onClick={() => {
                  navigate("/profile");
                  handleLinkClick();
                }}
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
              onClick={() => {
                navigate("/login");
                handleLinkClick();
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
