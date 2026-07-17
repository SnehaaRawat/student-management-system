from rest_framework import viewsets

from accounts.permissions import IsAdminOrReadOnly, IsAdminOrTeacher
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer


class CourseViewSet(viewsets.ModelViewSet):
    """Everyone can browse courses; only admins manage them."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['teacher']
    search_fields = ['code', 'name']

    def get_queryset(self):
        qs = Course.objects.all()
        user = self.request.user
        if user.is_teacher:
            return qs.filter(teacher=user)
        if user.is_student:
            return qs.filter(enrollments__student__user=user).distinct()
        return qs


class EnrollmentViewSet(viewsets.ModelViewSet):
    """Admins and teachers manage enrollments; students can view their own."""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAdminOrTeacher]
    filterset_fields = ['student', 'course']

    def get_queryset(self):
        return Enrollment.objects.select_related('student', 'course')
