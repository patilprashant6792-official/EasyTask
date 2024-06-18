import datetime
from quart import g
from app.models.tenant.Task import Task

class TaskService:
    @staticmethod
    async def create_task(data):
        task = Task(
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status'),
            remind_at=data.get('remind_at'),
            sequence=data.get('sequence')
        )
        task_dict = task.to_dict()
        await g.user_db.Task.insert_one(task_dict)
        task_dict.pop('_id', None)  # Remove the '_id' field from the task dictionary
        return task_dict


    @staticmethod
    async def update_task(task_id, data):
        update_data = {
            "title": data.get('title'),
            "description": data.get('description'),
            "status": data.get('status'),
            "remind_at": data.get('remind_at'),
            "sequence": data.get('sequence'),
            "updated_at": datetime.datetime.now()
        }

        result = await g.user_db.Task.update_one(
            {"task_id": task_id, "is_deleted": False},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            return None

        task = await g.user_db.Task.find_one(
            {"task_id": task_id, "is_deleted": False},
            {"_id": False}
        )
        return task

    @staticmethod
    async def delete_task(task_id):
        result = await g.user_db.Task.update_one({"task_id": task_id}, {"$set": {"is_deleted": True}})
        return result.modified_count > 0

    @staticmethod
    async def search_tasks(query):
        tasks_cursor = g.user_db.Task.find({
            "$and": [
                {"is_deleted": False},
                {"$or": [
                    {"title": {"$regex": query, "$options": "i"}},
                    {"description": {"$regex": query, "$options": "i"}},
                    {"status": {"$regex": query, "$options": "i"}}
                ]}
            ]
        }).sort("updated_at", -1)  # Sort by updated_at in descending order
        tasks = await tasks_cursor.to_list(length=100)
        for task in tasks:
            task['_id'] = str(task['_id'])
        return tasks
