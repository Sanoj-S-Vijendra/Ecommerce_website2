import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // useEffect checks if the user is already logged in
  // if already loggedIn then it will simply navigate to the dashboard
  // TODO: Implement the checkStatus function.
  useEffect(() => {
    const checkStatus = async () => {
      try
      {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.status === 200) {
          navigate("/Dashboard");
        }
      }
      catch (error)
      {
        console.error("Error checking login status:", error);
      }
    };
    checkStatus();
  }, [navigate]);

  // Read about useState to manage form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // TODO: This function handles input field changes
  const handleChange = (e) => {
    // Implement your logic here
    const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
  };

  // TODO: Implement the login operation
  // This function should send form data to the server
  // and handle login success/failure responses.
  // Use the API you made for handling this.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement the login logic here
      try 
      {
          const response = await fetch(`${apiUrl}/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
              credentials: "include",
            });
            const data = await response.json();
            if (response.status === 200)
            {
              navigate("/Dashboard");
            }
            else
            {
              setErrorMessage(data.message || "Login failed");
            }
      }
      catch (error)
      {
          console.error("Error during login:", error);
          setErrorMessage("An unexpected error occurred");
      }
  };
  // TODO: Use JSX to create a login form with input fields for:
  // - Email
  // - Password
  // - A submit button
  const buttonStyle = {
    backgroundColor: "#555",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "10px",
          transition: "background-color 0.2s ease-in-out",
  }
  
  const buttonHoverStyle = {
    backgroundColor: "#333",
  }
  return (
    <div
  style={{
    backgroundColor: "#f0f0f0",
    padding: "20px",
    borderRadius: "8px",
    width: "300px", 
    margin: "20px auto", 
    fontFamily: "Arial, sans-serif",
  }}
>
  <h2 style={{ color: "#333", textAlign: "center", marginBottom: "15px" }}>
    Login
  </h2>
  {errorMessage && (
    <p style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>
      {errorMessage}
    </p>
  )}
  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
    <div style={{ display: "flex", flexDirection: "column"}}>
      <label htmlFor="email" style={{ color: "#555", marginBottom: "5px" }}>
        Email:
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        style={{
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          color: "#333",
        }}
      />
    </div>
    <div style={{ display: "flex", flexDirection: "column"}}>
      <label htmlFor="password" style={{ color: "#555", marginBottom: "5px" }}>
        Password:
      </label>
      <input
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        style={{
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          color: "#333",
        }}
      />
    </div>
    <button
      type="submit"
      style={buttonStyle}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = buttonStyle.backgroundColor;
      }}
    >
      Login
    </button>
  </form>
  <p style={{ marginTop: "15px", textAlign: "center", color: "#555" }}>
    Don't have an account? <Link to="/signup" style={{ color: "blue" }}>Sign up here</Link>
  </p>
</div>
  );
};

export default Login;
