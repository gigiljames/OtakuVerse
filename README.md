# 🛍️ OtakuVerse - E-Commerce Platform

OtakuVerse is a full-featured, modern E-Commerce web application dedicated to anime merchandise, apparel, collectibles, figurines, and accessories. Built using Node.js, Express, MongoDB, and EJS, OtakuVerse offers a seamless shopping experience for anime fans alongside a feature-rich admin management dashboard.

## 🛠️ Tech Stack

### **Backend**
- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Database & ORM**: MongoDB with Mongoose
- **Authentication**: Passport.js (Google OAuth 2.0), Express Session, bcrypt (Password Hashing)
- **File Uploads**: Multer, Cloudinary API
- **Payments**: Razorpay Node SDK
- **Mailing Services**: Nodemailer / Mailgun.js (OTP Verification & Notifications)
- **PDF Generation**: PDFKit / jsPDF (Automated Invoice Generation)

### **Frontend**
- **Templating Engine**: EJS (Embedded JavaScript)
- **Styling**: Custom Vanilla CSS3
- **Scripting**: Vanilla JavaScript (ES6+), jQuery (AJAX interactions)
- **UI Enhancements**: SweetAlert2 (Interactive Alerts & Dialogs), Magnify.js (Product Image Zoom)

## ✨ Features

### 👤 **Customer Side**
- **User Authentication & Security**:
  - Email & Password Registration with OTP Email Verification.
  - One-Click Social Login via Google OAuth 2.0.
  - Password Reset & Recovery mechanism.
- **Product Browsing & Search**:
  - Live search bar (by product name, description, or specifications).
  - Category-based filtering and multi-attribute sorting (Popularity, Price Low-High, Price High-Low, Customer Rating, Featured, New Arrivals, Name A-Z/Z-A).
- **Product Details & Interactivity**:
  - Dynamic image gallery with zoom magnifying lens.
  - Real-time variant selection (Size & Color) with live stock indicator.
  - Product specifications, description, category offers, customer reviews, and average rating calculation.
  - Personalised "Recommended Products" section.
- **Cart & Wishlist**:
  - Add/Remove items to Cart and Wishlist.
  - Real-time bill recalculation including subtotal, discounts, delivery charges, and coupon savings.
  - Quantity validation (max 5 items per product variant, stock limits check).
- **Checkout & Multi-Payment System**:
  - Address selection or new address addition at checkout.
  - **Payment Gateways**:
    - **Razorpay**: Online card/UPI/netbanking payments with built-in Payment Retry for failed transactions.
    - **OtakuVerse Wallet**: Direct payment using customer wallet balance.
    - **Cash on Delivery (COD)**: Available for orders below ₹1,000.
  - Coupon Code redemption with min-spend and usage-limit validation.
- **Orders & Refunds**:
  - Order history tracking with item status (Processing, Shipping, Out for Delivery, Delivered, Cancelled, Returned).
  - Item-level and full order cancellation.
  - Return request submission with custom reasons.
  - Instant PDF Invoice download for completed orders.
- **Customer Profile & Wallet**:
  - Address book management (Add, Edit, Delete addresses).
  - OtakuVerse Wallet showing balance and detailed transaction history (debits for purchases, automated credits for returns/cancellations).


### 🛡️ **Admin Side**
- **Sales Analytics Dashboard**:
  - Interactive sales performance overview (Weekly, Monthly, Yearly, and Custom Date Range filters).
  - Top 10 Best-Selling Products and Top Categories statistics.
- **Product & Variant Management**:
  - Complete Product CRUD operations (Add, Edit, Enable/Disable, Delete).
  - Multi-image upload with Cloudinary integration and client-side image cropping interface.
  - Product Variant management (Size, Color, and Stock Quantity edits).
- **Category Management**:
  - Add, edit, list, and soft-delete categories.
  - Category-wide percentage discounts/offers that automatically apply to products.
- **Customer Management**:
  - View all registered customers.
  - One-click Block / Unblock customer account toggles.
- **Order Management**:
  - View all customer orders with order items, payment status, and shipping address details.
  - Update status of individual order items (Processing, Shipping, Out for Delivery, Delivered).
  - Cancel orders or individual order items with automated stock restoration and wallet refunds.
- **Return Request Management**:
  - View incoming return requests submitted by customers with custom return reasons.
  - Approve or Reject return requests.
  - Mark returned items as received and trigger instant automated wallet refunds.
- **Coupon Management**:
  - Create flat-amount or percentage-based coupons.
  - Define minimum spend requirements, expiry dates, and usage limits per customer.
  - Enable, disable, or delete active coupons.


## 💻 Step-by-Step Setup & Installation

### 📋 **Prerequisites**
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (v9.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)


### 1. **Clone the Repository**
```bash
git clone https://github.com/gigiljames/OtakuVerse.git
cd OtakuVerse
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Configuration**
Create a `.env` file in the root directory of the project and populate it with your credentials:

```env
# Server Configuration
PORT=3000
DOMAIN=http://localhost:3000
SESSION_SECRET=your_super_secret_session_key

# Database
MONGODB_URL=mongodb://localhost:27017/otakuverse

# Razorpay Payment Gateway
RAZORPAY_ID_KEY=your_razorpay_key_id
RAZORPAY_SECRET_KEY=your_razorpay_secret_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Verification / Nodemailer / Mailgun
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### 4. **Run the Application**

#### **Development Mode (with Nodemon auto-reload):**
```bash
npm run dev
```

#### **Production Mode:**
```bash
node app.js
```

### 5. **Access the Application**
- **Customer Frontend**: Open your browser and navigate to `http://localhost:3000`
- **Admin Portal**: Navigate to `http://localhost:3000/admin`
