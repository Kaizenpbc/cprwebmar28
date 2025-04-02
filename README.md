# CPR Training System

A comprehensive system for managing CPR training courses, instructors, and students.

## Project Structure

This project is organized as a monorepo with the following structure:

- `client/`: React frontend application
- `server/`: Node.js/Express backend application
- `shared/`: Shared types and utilities

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   cd server
   npm run init-db
   ```

4. Start the development servers:
   ```
   npm start
   ```

This will start both the client and server in development mode.

## Development

### Client

The client is a React application built with TypeScript.

```
cd client
npm start
```

### Server

The server is a Node.js/Express application built with TypeScript.

```
cd server
npm run dev
```

## Building for Production

To build both client and server for production:

```
npm run build
```

## License

This project is licensed under the ISC License. 