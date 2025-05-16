import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

// Use the API you implemented earlier, 
// to check if the user is logged in or not
// if yes, navigate to the dashboard
// else to the login page

// use the React Hooks useNavigate and useEffect
// to implement this component
const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const checkLoginStatus = async () => {
      try
      {
          const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: "include", // Crucial for sending cookies
        });
        if(response.status === 200)
        {
          navigate("/Dashboard");
        }
        else
        {
          navigate("/Login");
        }
      }
      catch (err)
      {
        console.error("Error checking login status:", err);
        navigate("/Login");
      }
    };

    checkLoginStatus();
  }, [navigate]);
  return <div>HomePage</div>;
};

export default Home;