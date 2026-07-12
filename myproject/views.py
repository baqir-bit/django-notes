from django.http import JsonResponse

def home(request):
    # This simulates a list of tasks coming from a database
    my_tasks = [
        {
            "id": 1,
            "task_name": "Setup Django Environment",
            "status": "Completed"
        },
        {
            "id": 2,
            "task_name": "Build first API endpoint",
            "status": "In Progress"
        },
        {
            "id": 3,
            "task_name": "Learn about Django Models",
            "status": "Pending"
        }
    ]
    
    # safe=False allows Django to convert a Python list (instead of a dictionary) into JSON
    return JsonResponse(my_tasks, safe=False)