import React from "react";
import Profile from "../../src/components/Profile/Profile";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";

const ProfilePage = () => {
  return (
    <>
        <Navbar />
    <div className="profile-page">
      <Profile />
    </div>
        <Footer />
    </>
  );
};

export default ProfilePage;
