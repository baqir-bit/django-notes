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
    try :
        data = json.loads(request.body)
    except json.JSONDecodeError :
        return JsonResponse({"error" : "Invalid JSON"}, status=400)
    
    if not data :
        return JsonResponse({"error" : "No data provided"}, status=400)
    
    title = data.get("title")
    content = data.get("content")
    priority = data.get("priority")

    if not isinstance(title,str) or not title.strip() :
        return JsonResponse({"error" : "Invalid title"}, status=400)

    if not isinstance(content,str) or not content.strip() :
        return JsonResponse({"error" : "Invalid content"}, status=400)

    if not isinstance(priority,int) or priority not in [0,1,2] :
        return JsonResponse({"error" : "Invalid priority"}, status=400)

    note = Note.objects.create(
        title = title,
        content = content,
        priority = priority
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
    except Note.DoesNotExist :
        return JsonResponse({"error" : "Note not found"}, status=404)   
     
    try :
        data = json.loads(request.body)
    except json.JSONDecodeError :
        return JsonResponse({"error" : "Invalid JSON"}, status=400)
    
    if not data :
        return JsonResponse({"error" : "No data provided"}, status=400)
    
    title = data.get("title")
    content = data.get("content")
    priority = data.get("priority")

    if "title" in data :
        if not isinstance(title,str) or not title.strip() :
            return JsonResponse({"error" : "Invalid title"}, status=400)

    if "content" in data :
        if not isinstance(content,str) or not content.strip() :
            return JsonResponse({"error" : "Invalid content"}, status=400)

    if "priority" in data :
        if not isinstance(priority,int) or priority not in [0,1,2] :
            return JsonResponse({"error" : "Invalid priority"}, status=400)  

    note.title = title if title is not None else note.title
    note.content = content if content is not None else note.content
    note.priority = priority if priority is not None else note.priority
    note.save()          

    return JsonResponse({
        "id" : note.id,
        "title" : note.title,
        "content" : note.content,
        "priority" : note.priority,
        "created_at" : note.created_at
    },status = 200)
    

    

def delete_note(request, note_id) :
    if request.method != "DELETE" :
        return JsonResponse({"error" : "Method not allowed"}, status=405)
    
    try :
        note = Note.objects.get(id=note_id)
        note.delete()
        return JsonResponse({"message" : "Note deleted successfully"}, status=200)
    
    except Note.DoesNotExist :
        return JsonResponse({"error" : "Note not found"}, status=404)