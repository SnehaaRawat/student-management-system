from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdminOrTeacher
from students.models import Student
from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer, BulkAttendanceSerializer


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    """
    Admins/teachers mark and manage attendance. Students can view only
    their own records (read-only, enforced via get_queryset + permissions).
    """
    serializer_class = AttendanceRecordSerializer
    filterset_fields = ['course', 'student', 'date', 'status']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminOrTeacher()]

    def get_queryset(self):
        user = self.request.user
        qs = AttendanceRecord.objects.select_related('student', 'course')
        if user.is_student:
            return qs.filter(student__user=user)
        if user.is_teacher:
            return qs.filter(course__teacher=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """
        Mark attendance for an entire class at once:
        {course, date, records: [{student, status}, ...]}
        """
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.validated_data['course']
        date = serializer.validated_data['date']
        created, updated = 0, 0

        for entry in serializer.validated_data['records']:
            student = Student.objects.get(pk=entry['student'])
            _, was_created = AttendanceRecord.objects.update_or_create(
                student=student, course=course, date=date,
                defaults={'status': entry['status'], 'marked_by': request.user},
            )
            created += int(was_created)
            updated += int(not was_created)

        return Response(
            {'created': created, 'updated': updated},
            status=status.HTTP_200_OK,
        )
