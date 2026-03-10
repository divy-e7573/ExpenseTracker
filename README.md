# Expense Tracker API & Frontend

A complete, full-stack Expense Tracker built with Node.js, Express, MongoDB, and Tailwind CSS. The master branch natively serves a beautiful frontend dashboard and connects to a secure JSON Web Token (JWT) authenticated backend API.

## Features
- **Secure Authentication**: Built-in user Registration and Login using JWT and `bcryptjs` password hashing.
- **Role-Based Expense Management**: Users can only Create, Read, Update, and Delete their own tracked expenses.
- **Analytics Dashboard**: Aggregation endpoints provide summaries and category breakdowns for easy visualization (Chart.js included).
- **Security & Performance**: API routes are protected by `helmet` and `express-rate-limit` to prevent DDoS/brute-force attacks. 

---

## 📂 Project Structure

```text
├── public/                 # Static Frontend HTML/CSS/JS Files
│   ├── js/             
│   │   ├── auth.js         # Frontend logic for Login/Signup
│   │   ├── dashboard.js    # Logic for Charts & Analytics fetching
│   │   ├── expenses.js     # Logic to render transactions table
│   │   └── utils.js        # Core API fetch wrapper and Toast notifications
│   ├── All_expenses_list.html
│   ├── financial_dashboard.html
│   ├── login_page.html
│   └── Sign_up_page.html
├── src/                    # Node.js backend source code
│   ├── config/             # DB Connection Logic
│   ├── controllers/        # API Route Logic (authController, expenseController)
│   ├── middleware/         # Custom Middlewares (auth validation)
│   ├── models/             # Mongoose DB Schemas (User, Expense)
│   └── routes/             # Express API Routers
├── .env                    # Environment Variables Configuration
├── package.json        
└── server.js               # Express application entry point
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A running instance of MongoDB. You can download [MongoDB Compass](https://www.mongodb.com/products/tools/compass) for a local database, or use a cloud database like MongoDB Atlas.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/divy-e7573/ExpenseTracker.git
cd ExpenseTracker
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root of the project directory and add the following values:
```env
# The port the Express server will deploy to
PORT=5000 
NODE_ENV=development

# Your MongoDB Connection String. 
# Local Example: mongodb://127.0.0.1:27017/expense_tracker
MONGO_URI=your_mongodb_connection_string_here

# JWT Secret used for signing auth tokens (Replace with a random string)
JWT_SECRET=supersecretjwtkey_please_change_this_in_production
```

### 4. Start the Application
Run the backend Node server using `npm`:
```bash
node server.js
```

Once you see `Server running in development mode on port 5000` and `MongoDB Connected`, you can access the frontend dashboard by opening your browser and visiting:
**[http://localhost:5000/](http://localhost:5000/)**
