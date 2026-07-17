# Ledger — Student Management System

A full-stack student management system: Django REST Framework API +
React (Vite) frontend, with JWT auth and three roles (admin, teacher,
student).

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

- **Backend**: Render, Railway, or Fly.io all work well with Django.
  Set `DJANGO_DEBUG=False`, a real `DJANGO_SECRET_KEY`, and the
  Postgres env vars in `.env.example`. Run `migrate` and
  `collectstatic` as part of your build step.
- **Frontend**: Vercel or Netlify. Set `VITE_API_URL` to your deployed
  backend's `/api` URL, and add your frontend's origin to
  `CORS_ALLOWED_ORIGINS` on the backend.

## Notes for extending

- Add a `photo` field to `Student` and wire up `Pillow` + media storage
  if you want profile pictures.
- The `ReportCardView` is a good place to add a PDF export
  (e.g. with `reportlab` or `weasyprint`).
- `DashboardStatsView` currently computes stats on the fly; cache it
  (e.g. with `django-redis`) if the dataset grows large.
