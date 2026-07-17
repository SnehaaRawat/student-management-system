from rest_framework import serializers

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'roll_number', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'gender', 'grade_level', 'section',
            'guardian_name', 'guardian_phone', 'address',
            'admission_date', 'is_active',
        ]
        read_only_fields = ['id', 'admission_date']
