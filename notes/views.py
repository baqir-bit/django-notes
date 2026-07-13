from django.http import JsonResponse
from .models import Note
import json

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

def get_notes(request, note_id) :
    try :
        note = Note.objects.get(id=note_id)
        data = {
            "id" : note.id,
            "title" : note.title,
            "content" : note.content,
            "priority" : note.priority,
            "created_at" : note.created_at
        }
        return JsonResponse(data)
    except Note.DoesNotExist :
        return JsonResponse({"error" : "Note not found"}, status=404)
    
def create_note(request) :
    if request.method != "POST" :
        return JsonResponse({"error" : "Method not allowed"}, status=405)
    
    data = json.loads(request.body)
    note = Note.objects.create(
        title = data.get("title"),
        content = data.get("content"),
        priority = data.get("priority")
    )
    return JsonResponse({
        "id" : note.id,
        "title" : note.title,
        "content" : note.content,
        "priority" : note.priority,
        "created_at" : note.created_at
    },status = 201)

def update_note(request, note_id) :
    if request.method != "PUT" :
        return JsonResponse({"error" : "Method not allowed"}, status=405)
    
    try :
        note = Note.objects.get(id=note_id)
        data = json.loads(request.body)

        note.title = data.get("title",note.title)
        note.content = data.get("content",note.content)
        note.priority = data.get("priority",note.priority)
        note.save()

        return JsonResponse({
            "id" : note.id,
            "title" : note.title,
            "content" : note.content,
            "priority" : note.priority,
            "created_at" : note.created_at
        },status = 200)
     
    except Note.DoesNotExist :
        return JsonResponse({"error" : "Note not found"}, status=404)
    

def delete_note(request, note_id) :
    if request.method != "DELETE" :
        return JsonResponse({"error" : "Method not allowed"}, status=405)
    
    try :
        note = Note.objects.get(id=note_id)
        note.delete()
        return JsonResponse({"message" : "Note deleted successfully"}, status=200)
    
    except Note.DoesNotExist :
        return JsonResponse({"error" : "Note not found"}, status=404)