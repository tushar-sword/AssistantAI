import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../src/Redux/authSlice";


import "./AuthPages.css";

const RegisterPage = () => {
  const dispatch = useDispatch();
 const { isLoading, isError, isSuccess, message, user } = useSelector((state) => state.auth);


  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { username, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(register({ username, email, password }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {isError && <p className="error-text">{message}</p>}
        {isSuccess && user && (
          <p className="success-text">Welcome {user.username} 🎉</p>
        )}


        <p className="switch-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
