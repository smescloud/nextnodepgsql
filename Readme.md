
# AI-Next.js-Postgres-Node.js-Workflow

> Perform CRUD Operations with AI Chat.

<br>

AI-powered CRUD Next.js app with Postgres Database, and Node.js Backend.

<br>

## How to Run

1. Set up your OpenAI API key:
   - Add your OpenAI API key to the `.env.local` file in the frontend folder as 
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```

2. Run using Docker Compose:
   - Run `docker compose up -d` to start the application. This command will set up the frontend, database, and backend containers.

   or

3. Run frontend and containers locally:
   - Navigate to the frontend folder and start the frontend locally.
   ```
    yarn dev
    ```
   - Run the database and backend containers.
   ```
    docker compose up db
    docker compose up backend
    ```
