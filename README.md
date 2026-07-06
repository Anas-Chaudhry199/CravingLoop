# CravingLoop

CravingLoop is a production-ready, full-stack multi-vendor food delivery application built on the MERN stack. The platform features an automated real-time order lifecycle tracking system seamlessly connecting Customers, Restaurants, and Riders.

## 🚀 Live Demo
https://craving-loop-frontend.vercel.app
---

##  Key Features

###  Role-Based Dashboards
* **Customer:** Browse nearby restaurants using geolocation, manage cart items, process secure payments, and track orders in real-time.
* **Restaurant / Owner:** Register and manage restaurant profiles, dynamically configure menu items (with image uploads), and control the food preparation pipeline.
* **Rider:** Real-time access to pending deliveries within the area, change order statuses, and mark orders as successfully delivered.

### ⚙️ Core Technical Highlights
* **Advanced Database Querying:** Leveraged complex **MongoDB Aggregation Pipelines** (`$lookup`, `$addFields`, etc.) to process optimized profile lookups and structural user queries.
* **Secure Authentication:** Implemented secure JWT-based login mechanisms utilizing **HTTP-Only Cookies** for seamless state persistence across origins.
* **Robust File Uploads:** Configured **Multer with a Serverless-compatible temporary filesystem (`/tmp`)** to stream restaurant and dish assets directly to **Cloudinary**.
* **Payment Gateway Integration:** Integrated **Stripe API**  for processing secure, end-to-end card transactions.
* **Security & Reliability:** Configured dynamic **CORS policies** to allow secure cross-origin communication supporting credentials.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Axios, Tailwind CSS, Redux/Redux Toolkit
* **Backend:** Node.js, Express.js, JWT (JsonWebToken)
* **Database & Storage:** MongoDB Atlas, Cloudinary
* **Payment Gateway:** Stripe API
* **Deployment:** Vercel (Serverless Functions)

---

## 📂 Project Architecture & Controllers
* **`auth.controller.js`**: Manages user registration, secure sign-in routines, profile initialization, and token validation.
* **`shop.controller.js`**: Handles geographic queries for nearby outlets, creation of restaurant listings, and asset management via Cloudinary.
* **`order.controller.js`**: Controls the multi-step status automation (`Preparing` ➡️ `Out for Delivery` ➡️ `Delivered`).
