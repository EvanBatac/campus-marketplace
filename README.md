# Campus Marketplace

A full-stack marketplace for campus communities. Browse and search listings, create and manage items for sale, and contact sellers through real-time messaging.

**Live demo:** coming soon

## Features

- Browse and search campus listings
- Register, sign in, and manage account settings
- Create listings with up to four images; edit or mark your items sold
- Message sellers and see online presence and unread messages
- Protected routes for listing management and messaging

## Tech stack

- **Client:** React 19, Vite, React Router, TanStack Query, Tailwind CSS
- **Server:** Node.js, Express 5, Socket.IO
- **Data and services:** MySQL, Cloudinary for listing images, JWT authentication

## Requirements

- Node.js 18 or newer and npm
- A MySQL database
- A Cloudinary account for image uploads

## Setup

Install dependencies in both applications:

```sh
cd server && npm install
cd ../client && npm install
```

### Set up the database

Run these commands from the repository root:

```bash
mysql -u root -p -e "CREATE DATABASE campus_marketplace;"
mysql -u root -p campus_marketplace < server/db/schema.sql
```

This setup is for a new, empty database. The schema dump drops and recreates its tables, so do not import it into a database containing data you need to keep.

### Create `server/.env`

Add the server configuration:

```dotenv
PORT=3000
CLIENT_ORIGINS=http://localhost:5173
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=campus_marketplace
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

`CLIENT_ORIGINS` accepts comma-separated frontend origins, without URL paths or trailing slashes. For local development, it defaults to `http://localhost:5173` if omitted.

### Create `client/.env`

Point the frontend at the server:

```dotenv
VITE_API_URL=http://localhost:3000
```

## Run locally

Start each app in a separate terminal from the repository root:

```sh
cd server && npm run dev
```

```sh
cd client && npm run dev
```

Vite serves the client at `http://localhost:5173`; the API and Socket.IO server use the port set by `PORT` (3000 in the example). The API health endpoint is `/api/health`.

## Useful commands

Run from the relevant directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `client` | `npm run dev` | Start Vite development server |
| `client` | `npm run build` | Build the production client into `client/dist` |
| `client` | `npm run preview` | Preview the production build |
| `client` | `npm run lint` | Run ESLint |
| `server` | `npm run dev` | Start the API with Node watch mode |
| `server` | `npm test` | Run the server test suite |

## Project layout

```text
client/   React application and UI
server/   Express API, Socket.IO, and server tests
```

## API overview

All routes under `/api/auth` except register and login require the header `Authorization: Bearer <token>`. Listing and conversation routes marked as protected also require authentication.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Check that the API is running |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/auth/me` | Get the current account |
| PATCH | `/api/auth/me` | Update account details |
| PATCH | `/api/auth/password` | Change password |
| GET | `/api/listings` | Browse and search listings |
| POST | `/api/listings` | Create a listing (authenticated; supports image upload) |
| GET | `/api/listings/mine` | Get the current user's listings (authenticated) |
| GET | `/api/listings/:id` | Get listing details |
| PUT | `/api/listings/:id` | Update a listing (authenticated owner) |
| DELETE | `/api/listings/:id` | Delete a listing (authenticated owner) |
| GET | `/api/conversations` | List conversations (authenticated) |
| POST | `/api/conversations` | Start or find a conversation (authenticated) |
| GET | `/api/conversations/:id/messages` | Get conversation messages (authenticated participant) |
| PATCH | `/api/conversations/:id/read` | Mark a conversation as read (authenticated participant) |

Chat messages and online presence are delivered over Socket.IO. The client connects to the same origin configured by `VITE_API_URL`.

## What's next

- Add listing categories and filters to browsing
- Add pagination controls and richer search options
- Improve account profile customization

## Author

Evan Batac — [GitHub](https://github.com/EvanBatac)
