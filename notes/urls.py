from django.urls import path
from . import views

urlpatterns = [path("",views.list_notes),path("<int:note_id>/",views.get_notes)]