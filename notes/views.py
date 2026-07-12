from django.http import JsonResponse
from .models import Note

def list_notes(request) :
    notes = Note.objects.all()

    data = []
    for note in notes :
        data.append({
            "id" : note.id,
            "title" : note.title,
            "content" : note.content,
            "priority" : note.priority,
            "created_at" : note.created_at
        })

    return JsonResponse(data, safe=False)
    

