from rest_framework import viewsets

from accounts.permissions import IsAdminOrReadOnly
from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    Admins/teachers can list & view all students. Only admins can create,
    update, or delete. A logged-in student only sees their own record.
    """
    serializer_class = StudentSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['grade_level', 'section', 'is_active']
    search_fields = ['first_name', 'last_name', 'roll_number']
    ordering_fields = ['roll_number', 'first_name', 'admission_date']

    def get_queryset(self):
        user = self.request.user
        qs = Student.objects.all()
        if user.is_student:
            return qs.filter(user=user)
        return qs
