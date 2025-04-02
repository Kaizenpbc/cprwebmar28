# CPR Training System Server

This is the backend server for the CPR Training System. It provides APIs for user authentication, organization management, and course scheduling.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=9005
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=cpr_db
   DB_PASSWORD=postgres
   DB_PORT=5432
   JWT_SECRET=your-secret-key-2024
   ```
4. Create the database:
   ```sql
   CREATE DATABASE cpr_db;
   ```
5. Run the database migrations (if any)

## Development

To start the development server:

```bash
npm run dev
```

This will start the server with hot-reload enabled.

## Building

To build the project:

```bash
npm run build
```

This will compile the TypeScript code to JavaScript in the `dist` directory.

## Production

To start the production server:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new organization and user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user information

### Organization

- `GET /api/organization/courses` - Get all courses for the organization
- `POST /api/organization/courses` - Schedule a new course
- `GET /api/organization/course-types` - Get available course types

## Error Handling

The server uses a global error handling middleware to catch and format errors. All errors are logged to the console and returned to the client with appropriate status codes.

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is enabled for the frontend domain
- Environment variables are used for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 