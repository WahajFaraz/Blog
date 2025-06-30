# Blogging Platform

This is a full-stack blogging platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (signup, login, logout)
- Create, read, update, and delete posts
- Rich text editor for creating and editing posts
- Media uploads for posts (images and videos)
- Commenting system
- User profiles with post history
- Dark/Light mode theme

## Tech Stack

### Frontend

- React
- React Router
- Redux for state management
- Styled-components for styling
- Framer Motion for animations
- Axios for API requests

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB instance (local or cloud)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/blogging-platform.git
    cd blogging-platform
    ```

2.  **Install server dependencies:**
    ```sh
    cd server
    npm install
    ```

3.  **Install client dependencies:**
    ```sh
    cd ../client
    npm install
    ```

### Configuration

1.  **Server:**
    Create a `.env` file in the `server` directory and add the following environment variables:
    ```
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

2.  **Client:**
    The client is configured to proxy API requests to the server at `http://localhost:5000`. You can change this in `client/vite.config.js` if needed.

### Running the Application

1.  **Start the server:**
    ```sh
    cd server
    npm start
    ```

2.  **Start the client:**
    ```sh
    cd ../client
    npm run dev
    ```

The application should now be running at `http://localhost:3000`.
