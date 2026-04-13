# AI-Next.js-Postgres-Node.js-Workflow

> User CRUD application built with Next.js, Node.js, and Postgres.

This repo now runs as a standard CRUD stack:

- `frontend`: Next.js app with a hosted-safe `/api` proxy layer
- `backend`: Express + Prisma API for `User` records
- `db`: Postgres database

## Features

- Create, list, update, and delete users from the browser
- Backend validation and health checks
- Docker Compose setup for local hosting
- Kubernetes manifests with the frontend proxying requests to the backend service

## How to Run

1. Run the full stack with Docker Compose:
   ```bash
   docker compose up --build
   ```

2. Open `http://localhost:3000`.

3. Optional local development without Docker for the frontend:
   - Start the backend on `http://localhost:4000`
   - Add this to `frontend/.env.local`
   ```bash
   BACKEND_URL=http://localhost:4000
   ```
   - Start the frontend from the `frontend` folder
   ```bash
   npm run dev
   ```

4. Optional local development for the backend:
   - Set `DATABASE_URL`
   - From the `backend` folder run
   ```bash
   npm run db:push
   npm start
   ```
