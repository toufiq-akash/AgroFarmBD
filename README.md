🌾 AgroFarmBD - Agriculture Inventory Management System

A modern full-stack web application for managing farming activities, users, and products — built with React, Node.js (Express), and MySQL.
It supports multiple user roles like Admin, Farmer, and Buyer, each with unique dashboards and permissions.

🚀 Features
👥 Authentication & Roles

Secure signup and login with hashed passwords (bcryptjs).

Role-based access:

Admin – Full control over users, products, and reports.

Farmer – Can add, update, and manage their own products.

Buyer – Can browse and purchase available farm products.

Account restriction system (admin can block/unblock users).

👤 Profile Management

Update profile name, email, and password.

Change password with old password verification.

Dynamic feedback after successful updates.

🧑‍💼 Admin Dashboard

View key statistics: total users, products, and orders.

Manage all registered users:

Delete, block, unblock, or restrict specific actions.

Manage all products and orders.

View and delete feedbacks and user reports.

🌿 Product Management

Farmers can add new products with name, price, image, and description.

Admin can view and delete any product.

All users can browse available products.

💬 Feedback & Reports

Users can submit feedback or report other users.

Admin can view and delete reports per user.

| Layer           | Technology                     |
| --------------- | ------------------------------ |
| **Frontend**    | React.js, React Router, Axios  |
| **Backend**     | Node.js, Express.js            |
| **Database**    | MySQL                          |
| **Security**    | bcrypt.js for password hashing |
| **Other Tools** | CORS, JSON communication       |




⚙️ Installation Guide
1️⃣ Clone the repository
git clone https://github.com/yourusername/agrofarming-system.git
cd agrofarming-system

2️⃣ Backend Setup
📁 Navigate to backend folder (if separate)
cd backend

🧩 Install dependencies
npm install express mysql2 cors bcryptjs

⚙️ Create MySQL Database

Open phpMyAdmin or MySQL shell and run:

```
CREATE DATABASE signup;

USE signup;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2),
  image TEXT,
  description TEXT
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT,
  userId INT,
  status VARCHAR(50)
);

CREATE TABLE feedbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  message TEXT
);

CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporterId INT,
  reportedUserId INT,
  reason TEXT
);
```

🧠 Start the backend server
node server.js


✅ Your backend should now run on
http://localhost:5000



3️⃣ Frontend Setup
📁 Navigate to frontend folder
cd frontend

📦 Install React dependencies
npm install

▶️ Start React app
npm run dev


✅ Frontend runs on
http://localhost:5173
 (or shown port)




🌈 Folder Structure

```
project-root/
│
├── backend/
│   ├── server.js          # Main Express server file
│   ├── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── CustomerProfile.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AddProduct.jsx
│   │   ├── ViewProducts.jsx
│   │   ├── ...
│   ├── package.json
│
└── README.md
```

🧩 API Endpoints Summary

| Type       | Endpoint                        | Description              |
| ---------- | ------------------------------- | ------------------------ |
| **POST**   | `/signup`                       | Register a new user      |
| **POST**   | `/login`                        | Login existing user      |
| **PUT**    | `/users/:id`                    | Update user profile      |
| **GET**    | `/admin/stats`                  | Dashboard statistics     |
| **GET**    | `/admin/users`                  | Get all users            |
| **PUT**    | `/admin/users/restrict/:id`     | Restrict/unrestrict user |
| **DELETE** | `/admin/users/:id`              | Delete user              |
| **POST**   | `/add-product`                  | Add new product          |
| **GET**    | `/get-products`                 | Fetch all products       |
| **GET**    | `/admin/products`               | Admin product list       |
| **DELETE** | `/admin/products/:id`           | Delete product           |
| **GET**    | `/admin/orders`                 | Get all orders           |
| **DELETE** | `/admin/orders/:id`             | Delete order             |
| **GET**    | `/admin/feedbacks`              | View feedbacks           |
| **GET**    | `/admin/reports`                | View reports             |
| **DELETE** | `/admin/reports/delete/:userId` | Delete reports of a user |




🔒 Security Highlights

All passwords hashed with bcryptjs.

Role-based control for access and management.

Admin-only access for sensitive endpoints.

Restriction system to prevent blocked users from login.



🧑‍💻 Contributors

👨‍💻 Toufiq Hasan 
    0802310205101080                             -Developer & Designer
👨‍💻 Mahmudul Hasan
    0802310205101087
👨‍💻 Abu Syed Rahat
    0802310205101083


Level 3 Term 2 Web Enginnering project  
Bangladesh Army University of Science and Technology, Saidpur
🗓️ Year: 2025
📚 Technologies used: React, Node, Express, MySQL


❤️ Thank You!

“Empowering farmers and simplifying agriculture management — one line of code at a time.” 🌿
