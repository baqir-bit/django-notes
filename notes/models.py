from django.db import models

# Create your models here.
class Note(models.Model) :
    title = models.CharField(max_length = 100)
    content = models.TextField()
    priority = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add= True)
