# Elite Sports API
##### Live api - [https://elite-sports-academy-server-ten.vercel.app/](https://elite-sports-academy-server-ten.vercel.app/)


This is the repository for the Elite Sports API, a powerful backend server application for managing sports classes and user registrations. The API provides a comprehensive set of features to handle user authentication, class management, payments, and role-based access control. It is built with Node.js, Express.js, MongoDB, JSON Web Tokens (JWT), and integrates with the Stripe payment platform.

## Features

- **User Authentication and Authorization**: Secure user registration and login using JWT for authentication. Role-based access control restricts access to certain routes based on user roles (admin, instructor, student).

- **Class Management**: Create, update, and delete sports classes. Retrieve class details including instructors, schedules, and available seats. Users can enroll in classes and manage their selected courses.

- **Payment Integration**: Seamless integration with the Stripe payment platform for handling payments. Users can make payments for selected courses, and the status of the selected course and available seats is updated accordingly.

- **Instructor and Class Recommendations**: Retrieve popular instructors and classes based on user ratings and enrollments.

- **Secure API**: Implement Cross-Origin Resource Sharing (CORS) for secure cross-origin requests. Protect routes with authentication and authorization middleware to ensure data privacy.

## Technologies Used

- **Node.js**: A powerful JavaScript runtime that allows server-side execution of JavaScript code.

- **Express.js**: A fast and minimalist web application framework for Node.js, used for building the RESTful API server.

- **MongoDB**: A flexible and scalable NoSQL database used for storing and retrieving data related to users, classes, selected courses, and payments.

- **JSON Web Tokens (JWT)**: A secure method for authenticating and authorizing users. JWTs are used to generate and verify tokens for accessing protected routes.

- **Stripe**: A widely-used payment platform that securely handles online payments. Stripe integration enables users to make payments for selected courses.

- **CORS**: Cross-Origin Resource Sharing is used to allow cross-origin requests from different domains while ensuring security and privacy.

## Installation and Usage

1. Clone the repository

2. Install dependencies: `npm install`

3. Set up environment variables: Create a `.env` file in the project root directory and provide the following variables:
   ```
   PORT=3000
   MONGODB_URI=<your_mongodb_uri>
   JWT_SECRET=<your_jwt_secret>
   STRIPE_SECRET_KEY=<your_stripe_secret_key>
   ```

4. Start the server: `npm start`

5. The API will be accessible at `http://localhost:3000`.


