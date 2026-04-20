# Resume Curator

## Run the project

This repo has two apps:
- `server/` (Express API)
- `client/` (Vite + React UI)

### 1) Install dependencies

From the repository root:

```bash
cd server && npm install
cd ../client && npm install
```

### 2) Start the backend (server)

```bash
cd server
npm run dev
```

Alternative server commands:

```bash
npm start        # run server without nodemon
npm run login    # open LinkedIn login flow and save session state locally
```

### 3) Start the frontend (client)

In a new terminal:

```bash
cd client
npm run dev
```

Other client commands:

```bash
npm run build    # production build
npm run preview  # preview production build locally
```

## Pre-push safety check

Run this before `git push` to remove local auth/session artifacts and detect likely secrets in tracked files.

### From the repository root

```bash
./scripts/pre-push-safety.sh
```

### From `server/` or `client/`

```bash
npm run prepush:safety
```
