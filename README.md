# SpendWise — Student Expense Tracker

SpendWise is a MERN-stack expense tracker built for the BharatCares / IBM SkillsBuild industrial training project. It lets a user create, view, update and delete expenses, filter them by month, and view total and category-wise spending.

## Features

- Add, edit and delete expenses
- Fields: title, amount, category, date and optional note
- Month-wise filtering
- Total spending and category-wise aggregation
- Search and category filter in the interface
- CSV export of the currently visible transactions
- Responsive React interface
- Express REST API with Mongoose validation

> **Scope note:** This starter version has no login or per-user access control, matching the single-user/demo scope described in the supplied report. Do not put real sensitive financial data into a public deployment.

## Project structure

```text
SpendWise/
  client/   React + Vite frontend
  server/   Express + MongoDB backend
```

## Run locally

Requirements: Node.js 18+ and an accessible MongoDB database (local MongoDB or MongoDB Atlas).

### 1. Configure the backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB connection string. Keep `.env` private; never commit it.

Example:
```env
PORT=5000
MONGO_URI=mongodb+srv://...
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

The API health endpoint is `http://localhost:5000/health`.

### 2. Configure the frontend

Open a second terminal:
```bash
cd client
npm install
```

Copy `.env.example` to `.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:5173`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend and database health |
| GET | `/api/expenses?month=YYYY-MM` | List expenses for a month |
| GET | `/api/expenses/summary?month=YYYY-MM` | Total and category totals |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

Example JSON body:
```json
{
  "title": "Lunch",
  "amount": 120,
  "category": "Food",
  "date": "2026-11-02",
  "note": "College canteen"
}
```

## Deploying

### MongoDB Atlas
1. Create a free Atlas cluster and database user.
2. In Network Access, allow the backend host to connect. For a student demo, `0.0.0.0/0` is easy to configure but broad; use stronger network restrictions where possible.
3. Copy the application connection string and replace the username, password and database name.
4. Add it as `MONGO_URI` in Render environment variables. Do not put it in frontend variables.

### Render backend
1. Push this project to a GitHub repository.
2. Create a new **Web Service** in Render and connect the repository.
3. Set **Root Directory** to `server`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGO_URI` = your Atlas connection string
   - `CLIENT_URL` = your Vercel frontend URL (after frontend deployment)
   - `NODE_ENV` = `production`
7. Deploy and open `https://YOUR-SERVICE.onrender.com/health`. It should return JSON with `"status":"ok"` and `"database":"connected"`.

### Vercel frontend
1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable `VITE_API_URL` = your Render service base URL, without a trailing slash.
7. Deploy.
8. Copy the Vercel domain and set it as `CLIENT_URL` in Render, then redeploy the backend.

## Manual smoke test before presentation

- Add a valid expense and verify it appears in the list.
- Add expenses in two categories and check the summary.
- Edit an expense and confirm the amount changes.
- Delete an expense and confirm it disappears.
- Change the month filter and verify only that month's entries appear.
- Refresh the browser and confirm records remain in MongoDB.
- Test the deployed `/health` endpoint.

Record actual results only after running these checks.

## Security and limitations

- No authentication or account separation is included.
- Keep `MONGO_URI` only in Render's environment variables.
- Do not commit `.env` files.
- Restrict database access and use a dedicated database user.
- Back up data before making changes to a real database.
