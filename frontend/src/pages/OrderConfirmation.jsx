import React from "react";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/OrderConfirmation.css";
import { Link } from "react-router-dom";

const OrderConfirmation = () => {
  // TODO: Implement the checkStatus function
  // If the user is logged in, fetch order details.
  // If not logged in, redirect the user to the login page.
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const checkStatus = async () => {
      // Implement logic here to check if the user is logged in
      // If not, navigate to /login
      // Otherwise, call the fetchOrderConfirmation function
      try
      {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.status === 200) 
        {
          fetchOrderConfirmation();
        }
        else
        {
          navigate("/Login");
        }
      }
      catch (error)
      {
        console.error("Error checking login status:", error);
        navigate("/Login");
      }
    };
    checkStatus();
  }, [navigate]);

  // TODO: Use useState to manage the orderDetails and error state


  // TODO: Implement the fetchOrderConfirmation function
  // This function should fetch order details from the API and set the state
  const fetchOrderConfirmation = async () => {
    // Implement your API call to fetch order details
    // Update the orderDetails state with the response data
    // Show appropriate error messages if any.
    try
    {
      const response = await fetch(`${apiUrl}/order-confirmation`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.status === 200)
      {
        const data = await response.json();
        setOrderDetails(data);
      }
      else
      {
        const data = await response.json();
        setError(data.message || "Failed to fetch order details.");
      }
    }
    catch (error)
    {
      console.error("Error fetching order confirmation:", error);
      setError("An unexpected error occurred.");
    }
  };
  if (error) {
    return <div className="order-confirmation-error">{error}</div>;
  }

  if (!orderDetails) {
    return <div>Loading order details...</div>;
  }

  const { order, orderItems } = orderDetails;

  return (
    <>
    {/* Implement the JSX for the order-confirmation
     page as described in the assignment. */}
     <Navbar />
     <div
  style={{
    backgroundColor: "#f0f0f0",
    padding: "20px",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "20px auto",
  }}
>
  <h1 style={{ textAlign: "center", color: "green", marginBottom: "20px" }}>
    Order Confirmation
  </h1>
  <p style={{ textAlign: "center", color: "#555", marginBottom: "15px" }}>
    Thank you for your order! Your order has been successfully placed.
  </p>
  <div
    style={{
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      padding: "15px",
      borderRadius: "4px",
      marginBottom: "20px",
    }}
  >
    <h2 style={{ color: "#333", marginBottom: "10px" }}>Order Details</h2>
    <p style={{ color: "#555", marginBottom: "5px" }}>Order ID: {order[0]?.order_id}</p>
    <p style={{ color: "#555", marginBottom: "5px" }}>
      Order Date: {new Date(order[0]?.order_date).toLocaleString()}
    </p>
    <p style={{ color: "#333", marginBottom: "5px" }}>
      Total Amount: <strong style={{fontWeight: 'bold'}}>$ {order[0]?.total_amount}</strong>
    </p>
  </div>
  <div
    style={{
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      padding: "15px",
      borderRadius: "4px",
      marginBottom: "20px",
    }}
  >
    <h2 style={{ color: "#333", marginBottom: "10px" }}>Items in Your Order:</h2>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "#e9ecef", color: "#495057" }}>
          <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
            Product ID
          </th>
          <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
            Product Name
          </th>
          <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
            Quantity
          </th>
          <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
            Price per Item
          </th>
          <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
            Total Price
          </th>
        </tr>
      </thead>
      <tbody>
        {orderItems
          .sort((a, b) => a.product_id - b.product_id)
          .map((item) => (
            <tr key={item.product_id} style={{ borderBottom: "1px solid #dee2e6" , textAlign: "center"}}>
              <td style={{ padding: "12px" }}>{item.product_id}</td>
              <td style={{ padding: "12px" }}>{item.name}</td>
              <td style={{ padding: "12px" }}>{item.quantity}</td>
              <td style={{ padding: "12px" }}>${item.price}</td>
              <td style={{ padding: "12px" }}>${item.tot_item_price}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
  <div style={{ textAlign: "center" }}>
    <Link to="/products" style={{ textDecoration: "none" }}>
      <button
        style={{
          backgroundColor: "#28a745", // Green
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "background-color 0.2s ease-in-out",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#1e7e34";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#28a745";
        }}
      >
        Continue Shopping
      </button>
    </Link>
  </div>
</div>
    </>
  );
};

export default OrderConfirmation;
