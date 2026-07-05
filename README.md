# Signal — a small, full-stack task tracker

A task tracker built to be a compact but complete example of full-stack development: a
typed REST API with authentication, a typed React frontend, a real test suite, and a
CI pipeline that runs on every push.

Built to be read as much as it's meant to be run — every piece is small enough to
review in a few minutes.

> 📸 **Add a screenshot here.** Run the app locally (see below), take a screenshot
> of the dashboard, save it to `docs/screenshot-dashboard.png`, and reference it
> with `![Dashboard](docs/screenshot-dashboard.png)`. A visual is the first thing
> recruiters look at, so it's worth the thirty seconds.

## Features

- Email/password signup and login, sessions handled with JWTs
- Create, edit, complete, and delete tasks
- Filter by status and priority, sort by due date / priority / title
- A small stats panel (todo / in progress / done / total)
- Each user only ever sees their own tasks

## Tech stack

| Layer      | Choice                                                             |
| ---------- | ------------------------------------------------------------------ |
| Backend    | Python, FastAPI, SQLModel (SQLAlchemy + Pydantic), SQLite          |
| Auth       | JWT (`python-jose`), password hashing with `passlib`/bcrypt        |
| Frontend   | React 18, TypeScript, Vite, React Router                           |
| Testing    | `pytest` + `httpx` (backend), `vitest` (frontend)                  |
| Tooling    | Docker + docker-compose, GitHub Actions CI, `ruff` + `eslint`       |

## Project structure

```
task-tracker/
├── backend/            FastAPI app, SQLModel models, JWT auth, pytest suite
├── frontend/           React + TypeScript app (Vite)
├── docker-compose.yml  Run both services with one command
└── .github/workflows/  CI: lint + test + build on every push
```

## Running it locally

### Option A — Docker (fastest)

```bash
docker compose up --build
```

- Backend: http://localhost:8000 (interactive docs at `/docs`)
- Frontend: http://localhost:5173

### Option B — running each side manually

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API is now at http://localhost:8000. SQLite needs no extra setup — a
`tasktracker.db` file is created automatically on first run.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app is now at http://localhost:5173.

## Running the tests

```bash
# backend — unit + integration tests, with coverage
cd backend
pytest

# frontend — unit tests
cd frontend
npm run test
```

Both suites also run automatically on every push via GitHub Actions
(see `.github/workflows/ci.yml`).

## API overview

| Method | Endpoint       | Description                          |
| ------ | -------------- | ------------------------------------- |
| POST   | `/auth/signup` | Create an account                     |
| POST   | `/auth/login`  | Log in, returns a JWT                 |
| GET    | `/auth/me`     | Current user                          |
| GET    | `/tasks`       | List your tasks (filter/sort via query params) |
| POST   | `/tasks`       | Create a task                         |
| GET    | `/tasks/{id}`  | Get one task                          |
| PUT    | `/tasks/{id}`  | Update a task                         |
| DELETE | `/tasks/{id}`  | Delete a task                         |
| GET    | `/tasks/stats` | Counts by status                      |

Full interactive documentation (Swagger UI) is available at `/docs` once the
backend is running.

## Deploying it

**Backend → Render (free tier)**

1. Push this repo to GitHub.
2. On [Render](https://render.com), create a **New Web Service**, connect your
   repo, and set the root directory to `backend`. Render will detect the
   `Dockerfile` automatically.
3. Add environment variables (Render dashboard → *Environment*):
   - `SECRET_KEY` — generate one: `python -c "import secrets; print(secrets.token_hex(32))"`
   - `DATABASE_URL` — `sqlite:///./tasktracker.db`
   - `CORS_ORIGINS` — leave as `http://localhost:5173` for now; you'll update
     this once the frontend is deployed (step 6 below).
4. Deploy. You'll get a URL like `https://your-api.onrender.com`.
5. **Know the trade-off**: Render's free tier has no persistent disk, and the
   service sleeps after 15 minutes of inactivity. That means the SQLite file
   resets on restarts/redeploys, and the first request after idle takes
   30–60 seconds to wake up. Fine for a portfolio demo; not fine for real
   users. If you need real persistence later, swap `DATABASE_URL` for a
   Postgres connection string (SQLModel makes this a one-line change) —
   Render's free Postgres lasts 30 days before expiring.

**Frontend → Vercel or Netlify (free tier)**

1. Import the same repo, set the root directory to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variable `VITE_API_URL` = your Render backend URL from above.
4. Deploy. You'll get a URL like `https://your-app.vercel.app`.

**Wire them together**

5. Back on Render, update `CORS_ORIGINS` to your frontend URL from step 4
   (comma-separate if you have more than one, e.g. a preview URL too), then
   redeploy the backend.
6. Visit your frontend URL, sign up, and create a task to confirm the two
   sides can talk to each other.
7. Add both live links to the top of this README so anyone opening the repo
   can try it immediately, e.g.:

   ```markdown
   **Live demo:** https://your-app.vercel.app (backend: https://your-api.onrender.com)
   ```



- **SQLite over Postgres**: keeps the project runnable with zero external
  services. `DATABASE_URL` is read from an environment variable, so swapping
  in Postgres is a one-line change plus a `psycopg2` dependency.
- **JWT over sessions**: keeps the backend stateless, which matches a
  frontend that's a separate SPA calling the API from a different origin.
- **SQLModel over separate SQLAlchemy models + Pydantic schemas**: less
  boilerplate for a project this size, while still keeping request/response
  schemas (`app/schemas.py`) distinct from the database tables
  (`app/models.py`).

## Possible next steps

- Pagination on `GET /tasks`
- Password reset flow
- Task tags/labels with many-to-many relationships
- Swap SQLite for Postgres and deploy (Render/Fly.io for the API,
  Vercel/Netlify for the frontend)

## License

MIT — do whatever you'd like with this.
