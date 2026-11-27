# Live Cursor Collaboration App

A full-stack learning project with user authentication, a live people dashboard, and real-time cursor sharing over WebSockets. The backend uses MongoDB for user data and Redis for temporary cursor snapshots.

## Features

- Register, log in, refresh a session, and log out.
- Store user accounts and refresh tokens in MongoDB.
- Hash passwords with `bcryptjs`.
- Use short-lived access tokens and refresh tokens in HTTP-only cookies.
- Show registered users and which users currently have an open WebSocket connection.
- Share live cursor positions and names with other connected users.
- Support multiple open tabs for the same user when tracking online presence.
- Save the latest cursor snapshot in Redis with a 30-second TTL.
- Send saved cursors to a newly connected user without changing the existing cursor message format.

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | Next.js, React, JavaScript, Axios, Tailwind CSS |
| Backend | Node.js, Express, JavaScript ES modules |
| Real-time communication | `ws` WebSocket library |
| Database | MongoDB with Mongoose |
| Cursor cache | Redis with `ioredis` |
| Authentication | JWT, HTTP-only cookies, `bcryptjs` |

## How Live Cursors Work

1. The frontend listens for mouse movement.
2. `requestAnimationFrame` schedules at most one mouse position update per browser frame. The cursor component also limits outgoing WebSocket messages to about 20 per second.
3. Cursor coordinates are sent as ratios between `0` and `1`, rather than screen pixels, so the receiving browser can position the cursor relative to its own viewport.
4. The backend checks the coordinates, broadcasts the cursor to other connected clients, and attempts to save it in Redis.
5. Redis stores JSON under `cursor:<userId>` for 30 seconds. Writes are limited to at most one per user every 100ms; skipped positions are not queued.
6. When a new WebSocket client connects, the backend scans Redis cursor keys and sends the saved cursors to that client in the existing `type: "cursor"` format. The new user's own cursor is skipped.
7. When a user's final WebSocket tab closes, the backend broadcasts `cursor-leave` and removes that user's Redis cursor.

Redis cursor data is a short-lived snapshot, not permanent storage. Redis expiry can clean up stale cursors if a process stops before it can remove them. Online presence is still stored in a backend `Map`, so it is local to one backend process and is not preserved across restarts.

## Project Structure

```text
Backend/
  src/
    Controllers/       # HTTP request handlers
    Routes/            # Authentication and user routes
    config/            # MongoDB and Redis connections
    middleware/        # HTTP and WebSocket authentication
    models/            # Mongoose models
    service/            # User, presence, and cursor services
    server.js           # Express and WebSocket server

Frontend/
  app/                  # Next.js pages and layouts
  src/
    components/         # Auth forms, dashboard, UI, and live cursors
    context/            # Authentication state
    hooks/              # Auth, mouse, dashboard, and WebSocket hooks
    lib/api/             # HTTP API client and auth requests
```

## Requirements

- Node.js and npm
- MongoDB, available locally or through a hosted MongoDB service
- Redis

For Ubuntu, Redis can be installed and started with:

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable --now redis-server
redis-cli ping
```

Redis should respond with `PONG`.

## Configuration

Create `Backend/.env` for backend settings. Do not commit this file or put real credentials in the README.

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
REDIS_URL=redis://127.0.0.1:6379
```

`PORT`, `CLIENT_URL`, and `REDIS_URL` have development defaults in the code. MongoDB and both JWT secrets should be configured for the backend to work correctly.

The frontend optionally reads `NEXT_PUBLIC_API_URL`. If it is not set, it uses `http://localhost:5000`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Put that setting in `Frontend/.env.local`. Never expose database connection strings or JWT secrets through a `NEXT_PUBLIC_` variable.

## Run Locally

Install dependencies and start the backend from its own directory:

```bash
cd Backend
npm install
npm run dev
```

In another terminal, install dependencies and start the frontend:

```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register or log in in two separate browser sessions to try live cursors.

## API Overview

All API routes are under `/api/auth`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| `POST` | `/register` | Public | Create an account and start a session |
| `POST` | `/login` | Public | Log in and start a session |
| `POST` | `/refresh-token` | Refresh token | Issue a new access token |
| `POST` | `/logout` | Access token | Log out and clear cookies |
| `GET` | `/me` | Access token | Get the current user |
| `GET` | `/users` | Access token | List other registered users |

The WebSocket server shares the backend HTTP server. It authenticates connections using the access-token cookie.

## Try Redis Cursor Storage

After moving a cursor while logged in, inspect cursor keys:

```bash
redis-cli SCAN 0 MATCH 'cursor:*' COUNT 100
redis-cli GET 'cursor:<userId>'
redis-cli TTL 'cursor:<userId>'
```

Replace `<userId>` with the MongoDB user ID. `TTL` reports the remaining lifetime in seconds. The key should expire within 30 seconds unless it is refreshed by another eligible cursor update.

To try cursor restoration, keep one user connected and moving their cursor, then connect a second user. The second user should receive the first user's latest saved cursor. Redis must remain running for this behavior.

## Learning Notes

### Backend Knowledge I Already Had

I already knew the authentication foundation used here: user registration and login, password hashing, JWT access/refresh tokens, HTTP-only cookies, protected routes, and MongoDB user data.

### What I Practiced and Learned in This Project

- **WebSockets:** authenticating a socket connection, handling message/close events, and sending live cursor updates.
- **Broadcasting:** sending each cursor update to other connected clients while excluding the sender.
- **Presence and multiple tabs:** tracking a user's active sockets with a `Map` of `Set`s, and only treating them as offline after their last tab disconnects.
- **Frame scheduling:** using `requestAnimationFrame` to group rapid mouse events into browser-frame updates and avoid unnecessary UI work.
- **Throttling:** limiting outgoing cursor messages in the frontend and Redis writes in the backend without delaying every live broadcast.
- **Redis basics:** creating a Redis client with `ioredis`, storing JSON with `SET` and `EX`, reading and deleting keys, checking TTL, and finding keys with `SCAN`.
- **Transient state design:** keeping the latest cursor in Redis with an expiry, while leaving online presence in the in-memory `Map`.

## Current Scope and Next Steps

- Redis stores cursors only; it does not store online presence.
- There is no Redis Pub/Sub or multi-backend synchronization yet. The in-memory presence map and WebSocket broadcasts currently belong to one backend process.
- Redis cursors expire after 30 seconds and are also removed when the user's last socket closes.
- Possible follow-up learning: Redis Pub/Sub for multiple backend instances, Redis-backed presence, and rate limiting.
