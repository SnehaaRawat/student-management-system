from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import GradeViewSet, ReportCardView, DashboardStatsView

router = DefaultRouter()
router.register('', GradeViewSet, basename='grade')

urlpatterns = [
    path('report-card/<int:student_id>/', ReportCardView.as_view(), name='report-card'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
] + router.urls
