import React from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import { Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the handleLogout function.
  // This function should do an API call to log the user out.
  // On successful logout, redirect the user to the login page.
  const handleLogout = async (e) => {
    e.preventDefault();
    // Implement logout logic here
    try
    {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for session management
      });
      if (response.status === 200)
      {
        navigate("/Login");
      }
      else
      {
        console.error("Logout failed");
      }
    }
    catch (error)
    {
      console.error("Error logging out:", error);
    }
  };

  // TODO: Use JSX to create a navigation bar with buttons for:
  // - Home
  // - Products
  // - Cart
  // - Logout
  const buttonStyle = {
    backgroundColor: "#555",
         color: "red",
         padding: "8px 15px",
         cursor: "pointer",
         border: "none",
         borderRadius: "4px",
         fontSize: "14px",
         fontWeight: "bold",
         transition: "background-color 0.3s ease",
   }
   
   const buttonHoverStyle = {
     backgroundColor: "white",
   }
  return (
    <nav
  style={{
    backgroundColor: "#2d2d2d", 
    padding: "12px 5px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center", 
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", 
    fontFamily: "Arial, sans-serif",
  }}
>
  <Link
    to="/Dashboard"
    style={{
      textDecoration: "none",
      color: "#f0f0f0", 
      fontSize: "16px",
      fontWeight: "bold",
      transition: "transform 0.37s ease-in-out",
    }}
    onMouseOver={(e) => {e.target.style.transform = 'scale(1.37)';}}
    onMouseOut={(e) => {e.target.style.transform = 'scale(1)';}}
  >
    Home
  </Link>
  <Link
    to="/Products"
    style={{
      textDecoration: "none",
      color: "#f0f0f0",
      fontSize: "16px",
      fontWeight: "bold",
      transition: "transform 0.37s ease-in-out",
    }}
    onMouseOver={(e) => {e.target.style.transform = 'scale(1.37)';}}
    onMouseOut={(e) => {e.target.style.transform = 'scale(1)';}}
  >
    Products
  </Link>
  <Link
    to="/Cart"
    style={{
      textDecoration: "none",
      color: "#f0f0f0",
      fontSize: "16px",
      fontWeight: "bold",
      ttransition: "transform 0.37s ease-in-out",
    }}
    onMouseOver={(e) => {e.target.style.transform = 'scale(1.37)';}}
    onMouseOut={(e) => {e.target.style.transform = 'scale(1)';}}
  >
    Cart
  </Link>
  <button
    onClick={handleLogout}
    style={buttonStyle}
    onMouseOver={(e) => {
      e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
    }}
    onMouseOut={(e) => {
      e.target.style.backgroundColor = buttonStyle.backgroundColor;
    }}
  >
    Logout
  </button>
</nav>
  );
};

export default Navbar;
