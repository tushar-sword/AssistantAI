import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../../Redux/authSlice";
import "./Profile.css";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, isLoading, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  if (isLoading) return <div className="profile-container">Loading...</div>;
  if (isError) return <div className="profile-container error">{message}</div>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {profile && (
        <div className="profile-card">
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
