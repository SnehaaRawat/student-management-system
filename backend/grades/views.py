from django.db.models import Avg, Count, Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrTeacher
from attendance.models import AttendanceRecord
from students.models import Student
from .models import Grade
from .serializers import GradeSerializer


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    filterset_fields = ['course', 'student', 'exam_name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminOrTeacher()]

    def get_queryset(self):
        user = self.request.user
        qs = Grade.objects.select_related('student', 'course')
        if user.is_student:
            return qs.filter(student__user=user)
        if user.is_teacher:
            return qs.filter(course__teacher=user)
        return qs


class ReportCardView(APIView):
    """All grades and an overall average for a single student."""
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        grades = Grade.objects.filter(student_id=student_id).select_related('course')
        data = GradeSerializer(grades, many=True).data
        avg_pct = grades.aggregate(
            avg=Avg('marks_obtained') / Avg('max_marks') * 100
        )['avg'] if grades.exists() else None
        return Response({
            'grades': data,
            'overall_percentage': round(avg_pct, 2) if avg_pct else None,
        })


class DashboardStatsView(APIView):
    """
    Aggregate numbers for the dashboard: headcounts, attendance rate,
    and grade distribution across letter bands.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_students = Student.objects.filter(is_active=True).count()

        attendance_qs = AttendanceRecord.objects.all()
        total_attendance = attendance_qs.count()
        present_count = attendance_qs.filter(status='present').count()
        attendance_rate = round(present_count / total_attendance * 100, 2) if total_attendance else 0

        grades = Grade.objects.all()
        distribution = {'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}
        for g in grades:
            distribution[g.letter_grade] += 1

        avg_pct = None
        if grades.exists():
            pcts = [g.percentage for g in grades]
            avg_pct = round(sum(pcts) / len(pcts), 2)

        return Response({
            'total_students': total_students,
            'attendance_rate': attendance_rate,
            'grade_distribution': distribution,
            'average_percentage': avg_pct,
        })
