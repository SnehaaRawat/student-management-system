from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['roll_number', 'first_name', 'last_name', 'grade_level', 'section', 'is_active']
    list_filter = ['grade_level', 'section', 'is_active']
    search_fields = ['first_name', 'last_name', 'roll_number']
