# Blogging Platform - Server

This is the server-side of the full-stack blogging platform. It is built with Node.js, Express, and MongoDB.

## Features

- User authentication (signup, login, logout) with JWT
- CRUD operations for posts
- Media uploads for posts with Multer
- Commenting system
- User profiles

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB instance (local or cloud)

### Installation

1.  **Install server dependencies:**
    ```sh
    npm install
    ```

### Configuration

Create a `.env` file in the `server` directory and add the following environment variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Running the Application

1.  **Start the server:**
    ```sh
    npm start
    ```
The server will be running at `http://localhost:5000`. 