import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/Cart.css";

const Cart = () => {
  // TODO: Implement the checkStatus function
  // If the user is already logged in, fetch the cart.
  // If not, redirect to the login page.
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pincode, setPincode] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      // Implement your logic to check if the user is logged in
      // If logged in, fetch the cart data, otherwise navigate to /login
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
          fetchCart();
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

  // TODO: Manage cart state with useState
  // cart: Stores the items in the cart
  // totalPrice: Stores the total price of all cart items
  // error: Stores any error messages (if any)
  // message: Stores success or info messages
  

  // TODO: Implement the fetchCart function
  // This function should fetch the user's cart data and update the state variables
  const fetchCart = async () => {
    // Implement your logic to fetch the cart data
    // Use the API endpoint to get the user's cart
    try
    {
      const response = await fetch(`${apiUrl}/display-cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200)
      {
        setCart(data.cart);
        setTotalPrice(data.totalPrice);
        setMessage(data.message);
      }
      else
      {
        setError(data.message || "Failed to fetch cart data.");
      }
    }
    catch (error)
    {
      console.error("Error fetching cart:", error);
      setError("An unexpected error occurred.");
    }
  };

  // TODO: Implement the updateQuantity function
  // This function should handle increasing or decreasing item quantities
  // based on user input. Make sure it doesn't exceed stock limits.
  const updateQuantity = async (productId, change, currentQuantity, stockQuantity) => {
    // Implement your logic for quantity update
    // Validate quantity bounds and update the cart via API
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0)
    {
      return removeFromCart(productId);
    }
    if (newQuantity > stockQuantity)
    {
      setMessage("Quantity exceeds available stock.");
      return;
    }
    try
    {
      const response = await fetch(`${apiUrl}/update-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId, quantity: change }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200)
      {
        setMessage(data.message);
        fetchCart();
      }
      else
      {
        setError(data.message || "Failed to update quantity.");
      }
    }
    catch (error)
    {
      console.error("Error updating quantity:", error);
      setError("An unexpected error occurred.");
    }
  };

  // TODO: Implement the removeFromCart function
  // This function should remove an item from the cart when the "Remove" button is clicked
  const removeFromCart = async (productId) => {
    // Implement your logic to remove an item from the cart
    // Use the appropriate API call to handle this
    try
    {
      const response = await fetch(`${apiUrl}/remove-from-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200)
      {
        setMessage(data.message);
        fetchCart();
      }
      else
      {
        setError(data.message || "Failed to remove item from cart.");
      }
    }
    catch (error)
    {
      console.error("Error removing from cart:", error);
      setError("An unexpected error occurred.");
    }
  };

  // TODO: Implement the handleCheckout function
  // This function should handle the checkout process and validate the address fields
  // If the user is ready to checkout, place the order and navigate to order confirmation
  const handleCheckout = async () => {
    // Implement your logic for checkout, validate address and place order
    // Make sure to clear the cart after successful checkout
    if (!pincode || !street || !city || !state)
    {
      setError("Please fill in all address fields.");
      return;
    }
    try
    {
      const response = await fetch(`${apiUrl}/place-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pincode, street, city, state }),
        credentials: "include",
      });
      if (response.status === 200)
      {
        setMessage("Order placed successfully!");
        setCart([]);
        setTotalPrice(0);
        navigate("/order-confirmation");
      }
      else
      {
        const data = await response.json();
        setError(data.message || "Failed to place order.");
      }
    }
    catch (error)
    {
      console.error("Error placing order:", error);
      setError("An unexpected error occurred.");
    }
  };

  // TODO: Implement the handlePinCodeChange function
  // This function should fetch the city and state based on pincode entered by the user
  const handlePinCodeChange = async (e) => {
    // Implement the logic to fetch city and state by pincode
    // Update the city and state fields accordingly
    const pin = e.target.value;
    setPincode(pin);
    if (pin.length === 6)
    {
      try
      {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data[0].Status === "Success")
        {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.Name);
          setState(postOffice.State);
        }
        else
        {
          setError("Invalid pincode.");
          setCity("");
          setState("");
        }
      }
      catch (error)
      {
        console.error("Error fetching pincode data:", error);
        setError("Failed to fetch pincode data.");
        setCity("");
        setState("");
      }
    }
    else
    {
      setCity("");
      setState("");
    }
  };
  
  // TODO: Display error messages if any error occurs
  if (error) {
    return <div className="cart-error">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          backgroundColor: "#f0f0f0", // Light grey background
          padding: "20px",
          borderRadius: "8px",
          fontFamily: "Arial, sans-serif",
          maxWidth: "1000px",
          margin: "20px auto", // Center the cart
        }}
      >
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>
        Your Cart
      </h1>

      {/* {message && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          {message}
        </div>
      )} */}

      {cart.length === 0 ? (
        <p style={{ textAlign: "center", color: "#555" }}>Your cart is empty</p>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#e9ecef", color: "#495057" }}>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
                  Product
                </th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
                  Price
                </th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
                  Stock Available
                </th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
                  Quantity
                </th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
                  Total
                </th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {cart
                .sort((a, b) => a.item_id - b.item_id)
                .map((item) => (
                  <tr key={item.item_id} style={{ borderBottom: "1px solid #dee2e6", textAlign: "center"}}>
                    <td style={{ padding: "12px" }}>{item.name}</td>
                    <td style={{ padding: "12px" }}>${item.price}</td>
                    <td style={{ padding: "12px" }}>{item.stock_quantity}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() =>
                          updateQuantity(item.item_id, -1, item.quantity, item.stock_quantity)
                        }
                        style={{
                          marginRight: "10px",
                          padding: "8px 14px",
                          borderRadius: "4px",
                          border: "none",
                          backgroundColor: "#6c757d", // Gray
                          color: "#fff",
                          cursor: "pointer",
                          transition: "background-color 0.3s ease",}}
                          onMouseOver={(e) => {e.target.style.backgroundColor = '#999';}}
                          onMouseOut={(e) => {e.target.style.backgroundColor = "#6c757d";}}
                      >
                        -
                      </button>
                      {item.quantity}
                      <button
                        onClick={() =>
                          updateQuantity(item.item_id, 1, item.quantity, item.stock_quantity)
                        }
                        style={{
                          marginLeft: "10px",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          border: "none",
                          backgroundColor: "#6c757d", // Gray
                          color: "#fff",
                          cursor: "pointer",
                          transition: "background-color 0.3s ease",}}
                          onMouseOver={(e) => {e.target.style.backgroundColor = '#999';}}
                          onMouseOut={(e) => {e.target.style.backgroundColor = "#6c757d";}}
                      >
                        +
                      </button>
                    </td>
                    <td style={{ padding: "12px" }}>${item.tot_item_price}</td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => removeFromCart(item.item_id)}
                        style={{
                          backgroundColor: "orange", // Red
                          color: "#fff",
                          padding: "8px 12px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background-color 0.3s ease",}}
                          onMouseOver={(e) => {e.target.style.backgroundColor = '#dc3545';}}
                          onMouseOut={(e) => {e.target.style.backgroundColor = "orange";}}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </div>

    <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "1030px", margin: "30px auto" }}>

      <div style={{ width: "37%" }}>
        <form>
          <div style={{ marginBottom: "5px" }}>
            <label htmlFor="pincode" style={{ marginRight: "10px", color: "#555" }}>
              Pincode:
            </label>
            <input
              type="text"
              id="pincode"
              value={pincode}
              onChange={handlePinCodeChange}
              placeholder="Enter Pincode"
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%" }} // Added width
            />
          </div>
          <div style={{ marginBottom: "5px" }}>
            <label htmlFor="street" style={{ marginRight: "10px", color: "#555" }}>
              Street:
            </label>
            <input
              type="text"
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Enter Street"
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%" }} // Added width
            />
          </div>
          <div style={{ marginBottom: "5px" }}>
            <label htmlFor="city" style={{ marginRight: "10px", color: "#555" }}>
              City:
            </label>
            <input
              type="text"
              id="city"
              value={city}
              placeholder="Enter City"
              readOnly // City is auto-filled
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#eee",
                color: "#777",
                width: "100%" // Added width
              }}
            />
          </div>
          <div style={{ marginBottom: "5px" }}>
            <label htmlFor="state" style={{ marginRight: "10px", color: "#555" }}>
              State:
            </label>
            <input
              type="text"
              id="state"
              value={state}
              placeholder="Enter State"
              readOnly // State is auto-filled
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#eee",
                color: "#777",
                width: "100%" // Added width
              }}
            />
          </div>
        </form>
      </div>


      <div style={{ width: "33%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <h3 style={{ color: "#333", marginTop: "200px", marginBottom: "3.7px", textAlign: "right" }}>
            Total: ${totalPrice}
          </h3>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            style={{
              backgroundColor: "#007bff", // Blue
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.2s ease-in-out",
              width: "100%"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#0056b3";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#007bff";
            }}
          >
            Proceed to Checkout
          </button>
    </div>
</div>
    </>
  );
};

export default Cart;
