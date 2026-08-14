# OtakuVerse Codebase Review: Features & Problems

After an in-depth review of the E-commerce Anime Merchandise project (OtakuVerse), here is a comprehensive list of proposed features to make the application more attractive, followed by a list of critical problems and bugs identified in the current codebase.

## 🚀 Proposed Features to Make it More Attractive

### For Users (Customers)
1. **Advanced Search & Filtering:** Implement faceted search allowing users to filter merchandise by price range, anime series, character, size, color, and category.
2. **Product Reviews & Image Uploads:** Allow users to upload pictures of the merchandise they received in their reviews. Add a "helpful" voting system for community moderation.
3. **Wishlist Sharing:** Allow users to generate a link to their wishlist to share with friends and family for birthdays or holidays.
4. **Loyalty/Reward Points System:** Introduce gamification where users earn "Otaku Points" for purchases and reviews, which can be redeemed for discounts on future orders.
5. **Guest Checkout:** Do not force users to create an account to buy something. Allow guest checkout to reduce cart abandonment rates.
6. **Social Login Integration:** Expand OAuth beyond Google to include Facebook, Discord, and X (Twitter), as anime communities are heavily active on these platforms.
7. **Order Tracking Integration:** Provide a visual timeline tracking of the shipment by integrating with a courier API (e.g., Shiprocket, Delhivery).
8. **Pre-Orders:** Allow users to pre-order upcoming figures or highly anticipated merchandise before their official release.
9. **Dynamic & Modern UI/UX:** Upgrade the EJS frontend with more interactive UI/UX components (e.g., using Alpine.js or Vue), implementing a sleek dark mode and smooth Framer Motion-like animations suitable for an anime theme.

### For the Admin (Shop Owner)
1. **Advanced Analytics Dashboard:** Add visual charts (using Chart.js or Recharts) for sales trends, conversion rates, and most popular items/categories over customizable time periods.
2. **Low Stock Alerts:** Automated email or dashboard notifications to the admin when a product variant drops below a defined stock threshold.
3. **Bulk Product Import/Export:** Add the ability to upload or download an Excel/CSV file to manage hundreds of products/variants simultaneously.
4. **Role-Based Access Control (RBAC):** Differentiate admin privileges by creating roles like "Super Admin", "Inventory Manager", and "Support Agent".
5. **Automated Email Marketing:** Implement automated emails for abandoned carts to remind users to complete their checkout, potentially offering a small automated discount code.

---

## ⚠️ Critical Problems & Bugs Found

> [!CAUTION]
> Several critical security vulnerabilities were found that could lead to financial loss or complete application compromise if deployed to production.

### Security Vulnerabilities
1. **Bypassable Payment Verification:** The `editPaymentStatus` endpoint (`PATCH /edit-payment-status/:orderID?status=completed`) allows *any* authenticated user to mark their order as paid by simply hitting the API. There is **no Razorpay signature verification** on the backend, meaning users can easily bypass the Razorpay gateway and get products for free.
2. **Development Logins Left in Production:** In both `adminRoute.js` and `custRoute.js`, there is a `constantLogin` middleware active that forcefully logs in a specific user (`hrx@fakemail.com`) or the admin. If this is deployed, every single visitor to the site will be logged in as that user/admin, exposing all private data.
3. **Insecure Session Cookies:** In `app.js`, `cookie.secure` is set to `false`. While acceptable for local development, this makes session cookies vulnerable to interception over HTTP in production.

### Logical & Mathematical Bugs
1. **Mathematically Incorrect Refund Calculation:** In `custOrderController.js` (`cancelItem`), when calculating a refund for an order that used a flat-value coupon, the deduction percentage is calculated as:
   `let couponPercentage = (order.amount / order.coupon_applied.value) * 100;`
   It *should* be `(order.coupon_applied.value / order.amount) * 100`. The current formula will result in percentages like 1000% being applied, causing massive calculation errors and incorrect (often negative) refunds.
2. **Floating Point Precision Issues:** Currency, prices, and discounts are handled using basic JavaScript numbers (e.g., `price * (1 - discount * 0.01)`). JavaScript's floating-point math can lead to precision bugs (e.g. `0.1 + 0.2 = 0.30000000000000004`). A library like `decimal.js` or storing values in the smallest currency unit (paise/cents) should be used.
3. **Hardcoded Shipping Costs:** The delivery charge (Rs. 80) and free delivery logic are strictly hardcoded in the `getBill()` function instead of being configurable settings in the admin database.
4. **Missing Database Transactions (Race Conditions):** During `createOrder`, stock availability is checked, and then stock is decremented in separate operations without using a database transaction or lock. If two users check out the last remaining item at the exact same millisecond, both orders will succeed, resulting in negative stock.

### Architecture & Code Quality Issues
1. **Fat Controllers:** The controllers are extremely large (e.g., `custOrderController.js` is almost 1,000 lines). Business logic, database queries, mathematical calculations (like `getBill`), and HTTP response handling are all tightly coupled, making the code hard to test and maintain.
2. **Hardcoded MongoDB URI:** The database connection string `mongoose.connect("mongodb://127.0.0.1:27017/OtakuVerse")` in `app.js` is hardcoded instead of utilizing environment variables (`process.env.MONGODB_URI`), violating 12-factor app principles.
3. **Lack of Proper Error Handling:** Most `catch` blocks simply run `console.log(error)` without sending a response back to the client. If an error occurs, the user gets no feedback, and the HTTP request hangs indefinitely, leading to a terrible user experience.
