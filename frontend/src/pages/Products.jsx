import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Products = () => {
  const navigate = useNavigate(); // Use this to redirect users
  // TODO: Implement the checkStatus function.
  // This function should check if the user is logged in.
  // If not logged in, redirect to the login page.
  // if logged in, fetch the products
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here to check login status
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
          fetchProducts();
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
    checkStatus();
  }, [navigate]);

  // Read about useState to understand how to manage component state
  // NOTE: You are free to add more states and/or handler functions
  // to implement the features that are required for this assignment
  // TODO: Fetch products from the APIx
  // This function should send a GET request to fetch products
  const fetchProducts = async () => {
    // Implement the API call here to fetch product data
    try
    {
      const response = await fetch(`${apiUrl}/list-products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.status === 200)
      {
        const data = await response.json();
        setProducts(data.products);
        const initialQuantities = {};
        data.products.forEach((product) => {
          initialQuantities[product.product_id] = 0;
        });
        setQuantities(initialQuantities);
      }
      else
      {
        setErrorMessage("Failed to fetch products.");
      }
    } 
    catch (err)
    {
      console.error("Error fetching products:", err);
      setErrorMessage("An unexpected error occurred.");
    }
  };
  
  // TODO: Implement the product quantity change function
  // If the user clicks on plus (+), then increase the quantity by 1
  // If the user clicks on minus (-), then decrease the quantity by 1
  const handleQuantityChange = (productId, change) => {
    setQuantities((prevQuantities) => {
      const newQuantity = Math.max(0, (prevQuantities[productId] || 0) + change);
      return {
        ...prevQuantities,
        [productId]: newQuantity,
      };
    });
  };

  // TODO: Add the product with the given productId to the cart
  // the quantity of this product can be accessed by using a state
  // use the API you implemented earlier
  // display appropriate error messages if any
  const addToCart = async (productId) => {
    try
    {
      const quantity = quantities[productId] || 0;
      const product = products.find((p) => p.product_id === productId);
      if (quantity > product.stock_quantity)
      {
        setErrorMessage(`Requested quantity exceeds available stock for ${product.name}.`);
        return;
      }
      const response = await fetch(`${apiUrl}/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId, quantity: quantity }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200) 
      {
        setErrorMessage(data.message);
      } else {
        setErrorMessage(data.message || "Failed to add to cart.");
      }
    }
    catch (error) 
    {
      console.error("Error adding to cart:", error);
      setErrorMessage("An unexpected error occurred.");
    }
  }

  // TODO: Implement the search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement the search logic here
    // use Array.prototype.filter to filter the products
    // that match with the searchTerm
  };
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // TODO: Display products with a table
  // Display each product's details, such as ID, name, price, stock, etc.
  return (
    <>
      <Navbar />
      <div>
  <h1 style={{ textAlign: "center", marginBottom: "20px", color: "Green" }}>
    Product List
  </h1>
  {errorMessage && (
    <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>
      {errorMessage}
    </p>
  )}
  <div style={{ display: 'flex', justifyContent: 'center' }}>
  <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
    <input
      type="text"
      placeholder="Search by product name..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        width: "300px",
        marginRight: "10px",
      }}
    />
    <button
      type="submit"
      style={{
        backgroundColor: "#888",
        color: "#fff",
        padding: "8px 15px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.2s ease-in-out",
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = '#333';
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = "#888";
      }}
    >
      Search
    </button>
  </form>
  </div>
  <div style={{ display: 'flex', justifyContent: 'center' }}>
  <table style={{ width: "80%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ backgroundColor: "#f2f2f2" }}>
        <th
          style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}
        >
          Product ID
        </th>
        <th
          style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}
        >
          Product Name
        </th>
        <th
          style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}
        >
          Price
        </th>
        <th
          style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}
        >
          Stock Available
        </th>
        <th
          style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}
        >
          Quantity
        </th>
        <th
          style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}
        >
          Action
        </th>
      </tr>
    </thead>
    <tbody>
      {filteredProducts
        .sort((a, b) => a.product_id - b.product_id)
        .map((product) => (
          <tr key={product.product_id} style={{ borderBottom: "1px solid #ddd", textAlign: "center" }}>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>
              {product.product_id}
            </td>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>
              {product.name}
            </td>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>
              ${product.price}
            </td>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>
              {product.stock_quantity}
            </td>
            <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
              <button onClick={() => handleQuantityChange(product.product_id, -1)} 
              style={{ marginRight: '10px', padding: '5px 10px', borderRadius: '4px', border: 'none', 
              backgroundColor: '#eee', cursor: 'pointer', transition: "background-color 0.3s ease",}}
              onMouseOver={(e) => {e.target.style.backgroundColor = '#999';}}
              onMouseOut={(e) => {e.target.style.backgroundColor = "#eee";}}>-</button>
              {quantities[product.product_id] || 0}
              <button onClick={() => handleQuantityChange(product.product_id, +1)} 
              style={{ marginLeft: '10px', padding: '4px 9px', borderRadius: '4px', border: 'none', 
              backgroundColor: '#eee', cursor: 'pointer', transition: "background-color 0.3s ease",}}
              onMouseOver={(e) => {e.target.style.backgroundColor = '#999';}}
              onMouseOut={(e) => {e.target.style.backgroundColor = "#eee";}}>+</button>
            </td>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>
            <button
    onClick={() => addToCart(product.product_id)}
    style={{
      backgroundColor: "#4CAF50", // Green color
      color: "white",
      padding: "8px 12px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    }}
    onMouseOver={(e) => {
      e.target.style.backgroundColor = '#367c39';
    }}
    onMouseOut={(e) => {
      e.target.style.backgroundColor = "#4CAF50";
    }}
  >
    Add to Cart
  </button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
  </div>
</div>
    </>
  );
};

export default Products;
