from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import Task
from .serializers import TaskSerializer

from django.views.generic import TemplateView
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title','description']
    ordering_fields = ['created_at','completed','title']

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class FrontendAppView(TemplateView):
    template_name = 'html/index.html'