from django.core.validators import MinValueValidator
from django.db import models

from courses.models import Course
from students.models import Student


class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    exam_name = models.CharField(max_length=100, help_text="e.g. Midterm, Final, Quiz 1")
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0)])
    max_marks = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(1)])
    date = models.DateField()

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.student} - {self.course} - {self.exam_name}"

    @property
    def percentage(self):
        if not self.max_marks:
            return 0
        return round(float(self.marks_obtained) / float(self.max_marks) * 100, 2)

    @property
    def letter_grade(self):
        pct = self.percentage
        if pct >= 90:
            return 'A+'
        if pct >= 80:
            return 'A'
        if pct >= 70:
            return 'B'
        if pct >= 60:
            return 'C'
        if pct >= 50:
            return 'D'
        return 'F'
