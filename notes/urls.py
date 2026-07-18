from django.urls import path
from . import views
urlpatterns = [path("",views.list_notes),path("<int:note_id>/",views.get_notes),path("create/",views.create_note),path("<int:note_id>/update/",views.update_note),path("<int:note_id>/delete/",views.delete_note)]