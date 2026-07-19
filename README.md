# Ledger — Student Management System

A full-stack student management system: Django REST Framework API +
React (Vite) frontend, with JWT auth and three roles (admin, teacher,
student).

## Live Demo

- Frontend: https://campuscore-portal.netlify.app
- Backend admin: https://student-management-system-dcuy.onrender.com/admin/
- Demo login: `admin` / `admin123`

> Note: the backend is hosted on Render's free tier, which spins down
> after inactivity. The first request after a while can take ~50
> seconds to wake up — this is expected, not a bug.

## Features

- JWT authentication with role-based access (admin / teacher / student)
- Student records: create, search, edit, deactivate
- Course catalog with teacher assignment and enrollment
- Attendance: mark a whole class at once, per course/date
- Grades: score entry, auto-computed percentage and letter grade, report cards
- Dashboard: headline stats + grade distribution chart

## Project structure

```
sms-project/
├── backend/            # Django + DRF API
│   ├── config/          # settings, urls
│   ├── accounts/        # custom User model, auth, permissions
│   ├── students/
│   ├── courses/
│   ├── attendance/
│   └── grades/
└── frontend/            # React + Vite + Tailwind
    └── src/
        ├── api/          # axios client with JWT refresh
        ├── context/      # auth context
        ├── components/   # Layout, Modal
        └── pages/        # Login, Dashboard, Students, Courses, Attendance, Grades
```

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # edit values if needed

python manage.py migrate
python manage.py seed_demo_data # creates demo users, students, courses, grades
python manage.py runserver
```

The API runs at `http://localhost:8000`. Demo logins after seeding:

| Username  | Password    | Role    |
|-----------|-------------|---------|
| admin     | admin123    | admin   |
| teacher1  | teacher123  | teacher |

(No student login is seeded by default — create one via `/admin/` and
link it to a `Student` record, or via the Django shell, if you want to
test the student role.)

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env    # points at http://localhost:8000/api by default
npm run dev
```

The app runs at `http://localhost:5173`.

## API overview

All endpoints are prefixed with `/api/` and require a `Bearer` access
token (except login).

| Endpoint                              | Notes                                   |
|----------------------------------------|------------------------------------------|
| `POST /auth/login/`                   | returns `access`, `refresh`, `user`      |
| `POST /auth/refresh/`                 | refresh an access token                  |
| `GET /auth/me/`                       | current user profile                     |
| `/students/`                          | list/create/update/delete (admin writes) |
| `/courses/`                           | list/create/update/delete (admin writes) |
| `/courses/enrollments/`               | manage enrollments                       |
| `/attendance/`                        | list/create attendance records           |
| `/attendance/bulk_mark/`              | mark a whole class at once               |
| `/grades/`                            | list/create/delete grades                |
| `/grades/report-card/<student_id>/`   | all grades + overall % for one student   |
| `/grades/dashboard-stats/`            | headcounts, attendance rate, distribution|

Permissions are enforced per role: admins can do everything; teachers
manage attendance/grades for their own courses; students can only read
their own records.

## Deploying

This project is actually deployed using:

- **Backend**: [Render](https://render.com) (free web service)
  - Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
  - Start command: `python manage.py migrate && gunicorn config.wsgi --bind 0.0.0.0:$PORT`
  - Env vars: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`,
    `CORS_ALLOWED_ORIGINS` (your frontend's URL), plus the `POSTGRES_*`
    vars below
- **Database**: [Neon](https://neon.tech) (free Postgres, doesn't expire
  or get deleted when idle — just pauses and auto-wakes on the next
  connection). Set `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
  `POSTGRES_HOST`, `POSTGRES_PORT=5432`, and `POSTGRES_SSLMODE=require`
  on the backend service.
- **Frontend**: [Netlify](https://netlify.com)
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`
  - Env var: `VITE_API_URL` set to the deployed backend's `/api` URL

Any similar combination (Railway, Fly.io, Vercel, Supabase, etc.) works
the same way — the settings above are just what this specific deploy
uses.

## Notes for extending

- Add a `photo` field to `Student` and wire up `Pillow` + media storage
  if you want profile pictures.
- The `ReportCardView` is a good place to add a PDF export
  (e.g. with `reportlab` or `weasyprint`).
- `DashboardStatsView` currently computes stats on the fly; cache it
  (e.g. with `django-redis`) if the dataset grows large.
