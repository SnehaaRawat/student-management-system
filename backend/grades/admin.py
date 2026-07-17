from django.contrib import admin

from .models import Grade


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'exam_name', 'marks_obtained', 'max_marks', 'date']
    list_filter = ['course', 'exam_name']
