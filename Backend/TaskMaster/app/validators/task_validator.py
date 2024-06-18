from quart import g

async def validate_task_creation(data):
    required_fields = ['title', 'description', 'status']
    for field in required_fields:
        if not data.get(field):
            return False, f"{field} is required"
    
    # Check for duplicate task name
    existing_task = await find_task_by_name(data.get('title'))
    if existing_task:
        return False, "A task with the same name already exists"
    
    return True, None

async def validate_task_update(task_id, data):
    if not data:
        return False, "No data provided for update"
    
    # Check for duplicate task name, excluding the current task
    existing_task = await find_task_by_name_for_update(data.get('title'), task_id)
    if existing_task:
        return False, "A task with the same name already exists"

    return True, None

async def find_task_by_name(title):
    user_db = g.user_db
    existing_task = await user_db.Task.find_one({"title": {"$regex": f"^{title}$", "$options": "i"}, "is_deleted": False})
    return existing_task

async def find_task_by_name_for_update(title, task_id):
    user_db = g.user_db
    existing_task = await user_db.Task.find_one(
        {"title": {"$regex": f"^{title}$", "$options": "i"}, "is_deleted": False, "task_id": {"$ne": task_id}}
    )
    return existing_task
