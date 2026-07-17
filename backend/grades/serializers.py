from rest_framework import serializers

from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    percentage = serializers.ReadOnlyField()
    letter_grade = serializers.ReadOnlyField()

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name',
            'exam_name', 'marks_obtained', 'max_marks', 'date',
            'percentage', 'letter_grade',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        marks = attrs.get('marks_obtained', getattr(self.instance, 'marks_obtained', None))
        max_marks = attrs.get('max_marks', getattr(self.instance, 'max_marks', None))
        if marks is not None and max_marks is not None and marks > max_marks:
            raise serializers.ValidationError('marks_obtained cannot exceed max_marks.')
        return attrs
