from rest_framework import serializers

from courses.models import Course
from .models import AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name',
            'date', 'status', 'marked_by',
        ]
        read_only_fields = ['id', 'marked_by']


class BulkAttendanceSerializer(serializers.Serializer):
    """Mark attendance for a whole class in one call."""
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    date = serializers.DateField()
    records = serializers.ListField(
        child=serializers.DictField(), allow_empty=False,
        help_text="[{student: id, status: 'present'|'absent'|'late'}, ...]",
    )
