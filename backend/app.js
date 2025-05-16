const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'cs349',
  host: 'localhost',
  database: 'ecommerce',
  password: 'foopassword',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code

function isAuthenticated(req, res, next) {
  if(!req.session.userId)
  {
    return res.status(401).json({ message: "Unauthorized: Please log in." });
  }
    next();
}

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', async (req, res) => {
  try
  {
    const {username, email, password} = req.body;
    if(!username || !password || !email)
    {
        return res.status(500).json({message: 'Error: Some fields are missing!'});
    }
    const u_name = username+"_";
    const u_password = password+"_";
    const hashedPassword = await bcrypt.hash(u_password, 10);
    await pool.query('BEGIN');
    const result = await pool.query('select email from Users where email = $1',[email]);
    if(result.rows.length != 0)
    {
      return res.status(400).json({message: 'Error: Email is already registered'});
    }
    else
    {
      await pool.query('with num_users as (select count (distinct user_id) as num from Users), m_id as (select max(user_id) as mx_id from Users), u_id as (select case when num_users.num = 0 then 1 else cast(m_id.mx_id as INTEGER)+1 end as ur_id from num_users, m_id) insert into users (user_id, username, email, password_hash) values ((select ur_id from u_id), $1, $2, $3)', [u_name, email, hashedPassword]);
      await pool.query('COMMIT');
      return res.status(200).json({message: 'User Registered Successfully', username: username, email: email, password: password, redirect: '/Login'});
    }
  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({message: 'Error signing up'});
  }
});

// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  try
  {
    const {email, password} = req.body;
    const u_pass = password+'_';
    if(!email || !password)
    {
      return res.status(500).json({message: 'Error: Some fields are missing!'});
    }
    const result = await pool.query('select * from Users where email = $1', [email]);
    if(result.rows.length === 0)
    {
      return res.status(400).json({message: 'Error: Invalid Credentials'});
    }
    const user = result.rows[0];
    if(await bcrypt.compare(u_pass, user.password_hash))
    {
      req.session.userId = user.user_id;
      let user_name = user.username.slice(0,-1);
      req.session.username = user_name;
      return res.status(200).json({message: 'Logged in successfully', email: email, password: password, redirect: '/Dashboard'});
      // res.redirect('/dashboard');
    }
    else
    {
      return res.status(400).json({message: 'Error: Invalid Credentials'});
    }
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Error in logging'});
  }
});


// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({message: 'Logged In', username: req.session.username});
  }
  else
  {
    return res.status(400).json({message: 'Not logged in'});
  }
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  try
  {
    res.clearCookie('connect.sid');
    req.session.destroy();
    return res.status(200).json({message: 'Logged out successfully', redirect: '/Login'});
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Failed to logout'});
  }
});

////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database
app.get("/list-products", isAuthenticated, async (req, res) => {
  try
  {
    if(!req.session.userId)
    {
      return res.status(400).json({message: 'Unauthorized'});
    }
    const result = await pool.query('select * from products');
    return res.status(200).json({message: 'Products fetched successfully', products: result.rows, redirect: '/Products'});
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Error listing products'});
  }
});

// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
  try
  {
    if(!req.session.userId)
    {
      return res.status(400).json({message: 'Unauthorized'});
    }
    const {product_id, quantity} = req.body;
    if(!product_id || !quantity)
    {
      return res.status(500).json({message: 'Error: Some fields are missing!'});
    }
    await pool.query('BEGIN');
    const result = await pool.query('select product_id, name from Products where product_id = $1', [product_id]);
    if(result.rows.length === 0)
    {
      return res.status(400).json({message: 'Error: Invalid Product ID'});
    }
    else
    {
      const added_item = await pool.query('select item_id from Cart where user_id = $1 and item_id = $2', [req.session.userId, product_id]);
      if(added_item.rows.length === 0)
      {
        await pool.query('insert into Cart (user_id, item_id, quantity) VALUES ($1, $2, $3)', [req.session.userId, product_id, quantity]);
      }
      else
      {
        await pool.query('update Cart set quantity = $1 where user_id = $2 and item_id = $3', [quantity, req.session.userId, product_id]);
      }
      const stock = await pool.query('select stock_quantity from Products where product_id = $1', [product_id]);
      if(stock.rows[0].stock_quantity < quantity)
      {
        await pool.query('ROLLBACK');
        return res.status(400).json({message: `Error: Insufficient stock for ${result.rows[0].name}`});
      }
      await pool.query('COMMIT');
      return res.status(200).json({message: `Successfully added ${quantity} of ${result.rows[0].name} to your cart`});
    }
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Error adding to cart'});
  }
});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
  try
  {
    if(!req.session.userId)
    {
      return res.status(400).json({message: 'Unauthorized'});
    }
    const result = await pool.query('select Cart.item_id, Products.product_id, Products.name, Products.stock_quantity, Cart.quantity, Products.price, (Cart.quantity * Products.price) as tot_item_price from Cart left outer join Products on Cart.item_id = Products.product_id where Cart.user_id = $1 order by Cart.item_id', [req.session.userId]);
    if(result.rows.length === 0)
    {
      return res.status(200).json({message: 'No items in cart', cart:[], totalPrice: 0, redirect: '/Cart'});
    }
    else
    {
      let total_price = 0;
      for(const item of result.rows)
      {
        total_price += parseFloat(item.tot_item_price);
      }
      total_price = parseFloat(total_price.toFixed(2));
      return res.status(200).json({message: 'Cart fetched successfully', cart: result.rows, totalPrice: total_price, redirect: '/Cart'});
    }
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Error fetching cart'});
  }
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {
  try
  {
    if(!req.session.userId)
    {
      return res.status(400).json({message: 'Unauthorized'});
    }
    const {product_id} = req.body;
    if(!product_id)
    {
      return res.status(500).json({message: 'Error: Some fields are missing!'});
    }
    await pool.query('BEGIN');
    const result = await pool.query('select item_id from Cart where item_id = $1 and user_id = $2', [product_id, req.session.userId]);
    if(result.rows.length === 0)
    {
      await pool.query('ROLLBACK');
      return res.status(400).json({message: 'Item not present in your cart.'});
    }
    else
    {
      await pool.query('delete from Cart where item_id = $1 and user_id = $2', [product_id, req.session.userId]);
      await pool.query('COMMIT');
      return res.status(200).json({message: 'Item removed from your cart successfully.'});
    }
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Error removing item from cart'});
  }
});
// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {
  try
  {
    if(!req.session.userId)
    {
      return res.status(400).json({message: 'Unauthorized'});
    }
    const {product_id, quantity} = req.body;
    if(!product_id || !quantity)
    {
      return res.status(500).json({message: 'Error: Some fields are missing!'});
    }
    await pool.query('BEGIN');
    let new_quantity = quantity;
    const s_quantity = await pool.query('select stock_quantity from Products where product_id = $1', [product_id]);
    const already = await pool.query('select item_id from Cart where item_id = $1 and user_id = $2', [product_id, req.session.userId]);
    if(already.rows.length === 0)
    {
      if(quantity <= 0) 
      {
        await pool.query('ROLLBACK');
        return res.status(400).json({message: 'Error: Quantity cannot be negative or zero'});
      }
      else if(quantity > s_quantity.rows[0].stock_quantity)
      {
        await pool.query('ROLLBACK');
        return res.status(400).json({message: 'Requested quantity exceeds available stock'});
      }
      await pool.query('insert into Cart (user_id, item_id, quantity) values ($1, $2, $3)', [req.session.userId, product_id, quantity]);
    }
    else
    {
      const prev_quantity = await pool.query('select quantity from Cart where item_id = $1 and user_id = $2', [product_id, req.session.userId]);
      new_quantity += prev_quantity.rows[0].quantity;
      if(new_quantity <= 0)
      {
        await pool.query('delete from Cart where item_id = $1 and user_id = $2', [product_id, req.session.userId]);
      }
      else if(new_quantity > s_quantity.rows[0].stock_quantity)
      {
        await pool.query('ROLLBACK');
        return res.status(400).json({message: 'Requested quantity exceeds available stock'});
      }
      else
      {
        await pool.query('update Cart set quantity = $1 where item_id = $2 and user_id = $3', [new_quantity, product_id, req.session.userId]);
        await pool.query('COMMIT');
        return res.status(200).json({message: 'Cart updated successfully'});
      }
    }
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Error updating cart'});
  }
});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {
  try
  {
    if(!req.session.userId)
    {
      return res.status(400).json({message: 'Unauthorized'});
    }
    const {pincode, street, city, state} = req.body;
    if(!pincode || !street || !city || !state)
    {
      return res.status(500).json({message: 'Error: Some fields are missing!'});
    }
    await pool.query('BEGIN');
    const  user_cart = await pool.query('select Cart.item_id as id, Products.name as name, Cart.quantity as quantity, Products.stock_quantity as stock_quantity, Products.price as price, (Cart.quantity * Products.price) as tot_item_price from Cart left outer join Products on Cart.item_id = Products.product_id where Cart.user_id = $1 order by Cart.item_id', [req.session.userId]);
    if(user_cart.rows.length === 0)
    {
      await pool.query('ROLLBACK');
      return res.status(400).json({message: 'Error: Cart is empty'});
    }
    let amount = 0;
    for(const item of user_cart.rows)
    {
      if(item.quantity > item.stock_quantity)
      {
        await pool.query('ROLLBACK');
        return res.status(400).json({message: `Error: Insufficient stock for ${item.name}`});
      }
      amount += parseFloat(item.tot_item_price);
    }
    await pool.query('with ord_id as (select max(order_id) as ord from Orders), num_orders as (select count (distinct order_id) as num from Orders), o_id as (select case when num_orders.num = 0 then 1 else cast(ord_id.ord as INTEGER)+1 end as or_id from ord_id, num_orders) insert into Orders (order_id, user_id, order_date, total_amount) values ((select or_id from o_id), $2, current_timestamp, $1)', [amount, req.session.userId]);
    for(const item of user_cart.rows)
    {
      await pool.query('insert into OrderItems (order_id, product_id, quantity, price) values ((select max(order_id) from Orders), $1, $2, $3)', [item.id, item.quantity, item.price]);
      await pool.query('update Products set stock_quantity = stock_quantity - $1 where product_id = $2', [item.quantity, item.id]);
    }
    await pool.query('insert into OrderAddress (order_id, street, city, state, pincode) values ((select max(order_id) from Orders), $1, $2, $3, $4)', [street, city, state, pincode]);
    await pool.query('delete from Cart where user_id = $1', [req.session.userId]);
    await pool.query('COMMIT');
    res.status(200).json({message: 'Order placed successfully'});
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Error placing order'});
  }
});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {
  try
  {
    if(!req.session.userId)
    {
      return res.status(400).json({message: 'Unauthorized'});
    }
    await pool.query('BEGIN');
    const order = await pool.query('select * from Orders where user_id = $1 and order_id = (select max(order_id) from Orders)', [req.session.userId]);
    if(order.rows.length === 0)
    {
      await pool.query('ROLLBACK');
      return res.status(400).json({message: 'Error: Order not found'});
    }
    const order_items = await pool.query('select OrderItems.order_id, OrderItems.product_id, OrderItems.quantity, OrderItems.price, Products.name, (OrderItems.quantity * Products.price) as tot_item_price from OrderItems left outer join Products on OrderItems.product_id = Products.product_id where OrderItems.order_id = $1', [order.rows[0].order_id]);
    await pool.query('COMMIT');
    return res.status(200).json({message: 'Order fetched successfully', order: order.rows, orderItems: order_items.rows, redirect: '/OrderConfirmation'});
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({message: 'Error fetching order details'});
  }
});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});