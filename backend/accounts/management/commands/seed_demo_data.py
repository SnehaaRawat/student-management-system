import datetime
import random

from django.core.management.base import BaseCommand

from accounts.models import User
from attendance.models import AttendanceRecord
from courses.models import Course, Enrollment
from grades.models import Grade
from students.models import Student


class Command(BaseCommand):
    help = "Seeds the database with demo users, students, courses, attendance, and grades."

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')

        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@example.com', 'role': User.Role.ADMIN, 'is_staff': True, 'is_superuser': True},
        )
        admin.set_password('admin123')
        admin.save()

        teacher, _ = User.objects.get_or_create(
            username='teacher1',
            defaults={'email': 'teacher1@example.com', 'first_name': 'Asha', 'last_name': 'Rao', 'role': User.Role.TEACHER},
        )
        teacher.set_password('teacher123')
        teacher.save()

        course1, _ = Course.objects.get_or_create(
            code='CS101', defaults={'name': 'Intro to Computer Science', 'credits': 4, 'teacher': teacher},
        )
        course2, _ = Course.objects.get_or_create(
            code='MATH201', defaults={'name': 'Discrete Mathematics', 'credits': 3, 'teacher': teacher},
        )

        first_names = ['Aarav', 'Diya', 'Kabir', 'Meera', 'Ishaan', 'Ananya', 'Vihaan', 'Sara']
        last_names = ['Sharma', 'Patel', 'Nair', 'Gupta', 'Reddy', 'Iyer', 'Khan', 'Das']

        students = []
        for i in range(1, 9):
            roll = f"2026-{i:03d}"
            student, _ = Student.objects.get_or_create(
                roll_number=roll,
                defaults={
                    'first_name': random.choice(first_names),
                    'last_name': random.choice(last_names),
                    'grade_level': '10',
                    'section': random.choice(['A', 'B']),
                    'guardian_phone': '9999999999',
                },
            )
            students.append(student)

        for student in students:
            for course in [course1, course2]:
                Enrollment.objects.get_or_create(student=student, course=course)

        today = datetime.date.today()
        for day_offset in range(5):
            date = today - datetime.timedelta(days=day_offset)
            for student in students:
                for course in [course1, course2]:
                    status = random.choices(
                        ['present', 'absent', 'late'], weights=[0.8, 0.15, 0.05]
                    )[0]
                    AttendanceRecord.objects.update_or_create(
                        student=student, course=course, date=date,
                        defaults={'status': status, 'marked_by': teacher},
                    )

        for student in students:
            for course in [course1, course2]:
                for exam in ['Quiz 1', 'Midterm']:
                    Grade.objects.get_or_create(
                        student=student, course=course, exam_name=exam,
                        defaults={
                            'marks_obtained': random.randint(50, 100),
                            'max_marks': 100,
                            'date': today,
                        },
                    )

        self.stdout.write(self.style.SUCCESS(
            'Done. Login as admin/admin123 or teacher1/teacher123.'
        ))
