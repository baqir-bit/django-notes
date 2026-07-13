from django.urls import path
from . import views
urlpatterns = [path("",views.list_notes),path("<int:note_id>/",views.get_notes),path("create/",views.create_note),path("update/<int:note_id>/",views.update_note),path("delete/<int:note_id>/",views.delete_note)]